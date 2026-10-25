module.exports = {
  config: {
    name: "slot",
    version: "9.0",
    author: "Saan",
    role: 0,
    countDown: 8,
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData }) => {
    const { senderID } = event;

    const formatMoney = (num) => {
      const n = Number(num);

      if (!Number.isFinite(n)) return "∞";
      if (Math.abs(n) < 1000) return n.toLocaleString("en-US");

      const units = [
        { v: 1e12, s: "T" },
        { v: 1e9, s: "B" },
        { v: 1e6, s: "M" },
        { v: 1e3, s: "K" }
      ];

      for (const u of units) {
        if (Math.abs(n) >= u.v) {
          return (n / u.v)
            .toFixed(2)
            .replace(/\.00$/, "")
            .replace(/(\.\d)0$/, "$1") + u.s;
        }
      }

      return n.toLocaleString("en-US");
    };

    function parseAmount(input) {
      if (!input) return NaN;

      const value = input.toLowerCase().replace(/,/g, "").trim();
      const match = value.match(/^(\d+(?:\.\d+)?)(k|m|b|t)?$/);

      if (!match) return NaN;

      const number = Number(match[1]);
      const suffix = match[2];

      const multipliers = {
        k: 1e3,
        m: 1e6,
        b: 1e9,
        t: 1e12
      };

      return number * (multipliers[suffix] || 1);
    }

    const betAmount = parseAmount(args[0]);
    const minBet = 100;
    const maxBet = 500e9;

    if (!Number.isFinite(betAmount) || betAmount < minBet) {
      return message.reply(
        `╭━━━〔 🎰 𝐇𝐄𝐀𝐑𝐓 𝐒𝐋𝐎𝐓 〕━━━╮\n` +
        `┃ 💰 Minimum Bet: 100$\n` +
        `┃ 🎯 Example: /slot 1k\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    if (betAmount > maxBet) {
      return message.reply(
        `🚫 Maximum Bet: ${formatMoney(maxBet)}$`
      );
    }

    const userData = await usersData.get(senderID);

    if (!userData) {
      return message.reply("⚠️ User data not found. Please try again.");
    }

    const currentMoney = Number(userData.money || 0);

    if (!Number.isFinite(currentMoney) || currentMoney < betAmount) {
      return message.reply(
        `╭━━━〔 💸 𝐋𝐎𝐖 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 〕━━━╮\n` +
        `┃ 💳 Balance: ${formatMoney(currentMoney)}$\n` +
        `┃ 🎯 Bet: ${formatMoney(betAmount)}$\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    if (!global.slotLimit) {
      global.slotLimit = {};
    }

    const now = Date.now();
    const resetDuration = 12 * 60 * 60 * 1000;
    let slotData = global.slotLimit[senderID];

    if (!slotData || now - slotData.lastReset >= resetDuration) {
      slotData = {
        count: 0,
        lastReset: now
      };

      global.slotLimit[senderID] = slotData;
    }

    const maxSpins = 15;

    if (slotData.count >= maxSpins) {
      return message.reply(
        `╭━━━〔 🎰 𝐇𝐄𝐀𝐑𝐓 𝐒𝐋𝐎𝐓 〕━━━╮\n` +
        `┃ ❌ All 15 plays have been used.\n` +
        `┃ ⏳ Please try again later.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const hearts = ["❤️", "💙", "💚", "💛", "💜", "🧡", "🖤", "🤍"];

    // 65% winning chance.
    const isWinSpin = Math.random() * 100 < 65;

    let reels = [];
    let multiplier = 0;

    if (isWinSpin) {
      const roll = Math.random() * 100;

      if (roll < 10) multiplier = 5;
      else if (roll < 40) multiplier = 3;
      else multiplier = 1.5;

      const matchCount = multiplier === 5 ? 4 : multiplier === 3 ? 3 : 2;
      const chosenHeart = hearts[Math.floor(Math.random() * hearts.length)];

      reels = Array(4).fill(null);

      for (let i = 0; i < matchCount; i++) {
        reels[i] = chosenHeart;
      }

      const otherHearts = hearts.filter(heart => heart !== chosenHeart);

      for (let i = matchCount; i < 4; i++) {
        reels[i] = otherHearts[Math.floor(Math.random() * otherHearts.length)];
      }

      // Shuffle without changing the number of matches.
      for (let i = reels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reels[i], reels[j]] = [reels[j], reels[i]];
      }
    } else {
      // Ensure no matching hearts on a losing spin.
      reels = [...hearts]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    }

    const win = isWinSpin;
    const winAmount = win ? betAmount * multiplier : 0;
    const finalMoney = win
      ? currentMoney - betAmount + winAmount
      : currentMoney - betAmount;

    const netProfit = win
      ? winAmount - betAmount
      : -betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);

    slotData.count++;

    const statusText = win
      ? `𝐉𝐀𝐂𝐊𝐏𝐎𝐓 ${multiplier}𝐗 ✨`
      : "𝐍𝐎 𝐌𝐀𝐓𝐂𝐇 💔";

    const payoutText = win
      ? `💰 Reward: +${formatMoney(winAmount)}$\n💎 Profit: ${netProfit >= 0 ? "+" : "-"}${formatMoney(Math.abs(netProfit))}$`
      : `💸 Loss: -${formatMoney(betAmount)}$`;

    const resultMessage =
      `╭━━━〔 💎 𝐇𝐄𝐀𝐑𝐓 𝐒𝐋𝐎𝐓 〕━━━╮\n` +
      `┃\n` +
      `┃   ${reels[0]}  │  ${reels[1]}  │  ${reels[2]}  │  ${reels[3]}\n` +
      `┃\n` +
      `┣━━━━━━━━━━━━━━━━━━━━━\n` +
      `┃ ${win ? "🎉" : "💔"} Result: ${statusText}\n` +
      `┃\n` +
      `┃ ${payoutText.replace(/\n/g, "\n┃ ")}\n` +
      `┃ 💳 Balance: ${formatMoney(finalMoney)}$\n` +
      `┃ 🎮 Plays: ${slotData.count}/${maxSpins}\n` +
      `┃\n` +
      `╰━━━〔 𝐒𝐀𝐀𝐍 〕━━━╯\n` +
      `〲 𝐒𝐀𝐀𝐍 𝐄𝐗𝐇𝐀𝐔𝐒𝐓𝐄𝐃 〲`;

    return message.reply(resultMessage);
  }
};