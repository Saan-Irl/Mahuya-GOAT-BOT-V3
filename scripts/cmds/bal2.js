module.exports = {
  config: {
    name: "bal2",
    aliases: ["bal2"],
    version: "1.0",
    author: "Siam Ahmed Saan",
    role: 2, // Admin only
    shortDescription: {
      en: "Manage users' balance"
    },
    longDescription: {
      en: "Add, remove, transfer or zero out balance of users"
    },
    category: "ECONOMY",
    guide: {
      en: "{pn} add/remove/out/transfer [amount] [uid or mention or reply]"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const action = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    let targetID = null;

    const send = (text) => api.sendMessage(text, threadID, messageID);

    if (["add", "remove", "transfer"].includes(action) && (isNaN(amount) || amount <= 0)) {
      return send("❌ Please enter a valid amount.");
    }

    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else if (!isNaN(args[2])) {
      targetID = args[2];
    }

    if (!targetID && action !== "out") {
      return send("❌ Please mention, reply to a user, or provide UID.");
    }

    switch (action) {
      case "add": {
        await usersData.addMoney(targetID, amount);
        const name = (await usersData.get(targetID)).name;
        send(`✅ Added ${amount}💵 to ${name}'s balance.`);
        break;
      }

      case "remove": {
        await usersData.subtractMoney(targetID, amount);
        const name = (await usersData.get(targetID)).name;
        send(`✅ Removed ${amount}💵 from ${name}'s balance.`);
        break;
      }

      case "out": {
        if (mentions && Object.keys(mentions).length > 0) {
          targetID = Object.keys(mentions)[0];
        } else if (messageReply) {
          targetID = messageReply.senderID;
        } else if (!isNaN(args[1])) {
          targetID = args[1];
        } else {
          return send("❌ Please specify a user (mention/reply/uid) to reset balance.");
        }

        await usersData.set(targetID, { money: 0 });
        const name = (await usersData.get(targetID)).name;
        send(`❌ ${name}'s balance has been reset to 0.`);
        break;
      }

      case "transfer": {
        if (targetID == senderID) return send("❌ You can't transfer to yourself.");
        const senderData = await usersData.get(senderID);
        if (senderData.money < amount) {
          return send("❌ You don't have enough balance to transfer.");
        }

        await usersData.subtractMoney(senderID, amount);
        await usersData.addMoney(targetID, amount);
        const targetName = (await usersData.get(targetID)).name;
        send(`✅ Transferred ${amount}💵 to ${targetName}.`);
        break;
      }

      default:
        send("❗ Usage:\n• balance add [amount] [mention/reply/uid]\n• balance remove [amount] [mention/reply/uid]\n• balance transfer [amount] [mention/reply/uid]\n• balance out [mention/reply/uid]");
    }
  }
};
