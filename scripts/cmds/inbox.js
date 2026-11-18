const util = require("util");

async function sendToInbox(api, body, targetID) {
  const e2eeReady = api.e2ee && typeof api.e2ee.isConnected === "function" && api.e2ee.isConnected();

  if (e2eeReady) {
    return await Promise.race([
      api.e2ee.sendMessage(String(targetID), { body }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timed out waiting for the E2EE bridge.")), 30000)
      )
    ]);
  }

  return sendPlain(api, body, targetID);
}

function sendPlain(api, body, targetID) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };
    const timer = setTimeout(
      () => done(reject, new Error("Timed out waiting for Facebook to confirm delivery.")),
      30000
    );

    try {
      const ret = api.sendMessage(body, targetID, (err, info) => {
        if (err) return done(reject, err);
        done(resolve, info);
      }, undefined, true);
      if (ret && typeof ret.then === "function") {
        ret.then(info => done(resolve, info)).catch(err => done(reject, err));
      }
    } catch (err) {
      done(reject, err);
    }
  });
}

function getMessageID(info) {
  if (!info) return null;
  if (typeof info === "string") return info;
  return info.messageID || info.messageId || info.message_id || info.id || null;
}

function getErrorText(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  return (
    err.errorDescription ||
    err.errorSummary ||
    err.message ||
    (typeof err.error === "string" ? err.error : null) ||
    util.inspect(err, { depth: 1 }).slice(0, 200)
  );
}

module.exports = {
  config: {
    name: "inbox",
    aliases: ["dm", "pm"],
    version: "2.1.0",
    author: "Inno Alt",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Bot sends a message to your inbox" },
    longDescription: { en: "The bot sends your message to your inbox. Bot admins can also send to another user." },
    category: "UTILITY",
    guide: {
      en:
        "   {pn} → bot messages your inbox\n" +
        "   {pn} <text> → bot sends <text> to your inbox\n\n" +
        "   Bot admin only:\n" +
        "   {pn} @mention <text> → send to the mentioned user\n" +
        "   {pn} <uid> <text> → send to that UID\n" +
        "   Reply to a user + {pn} <text> → send to that user"
    }
  },

  onStart: async function ({ api, event, args, message, role, usersData }) {
    const { senderID, messageID, mentions, messageReply } = event;
    const isAdmin = role >= 2;

    let targetID = String(senderID);
    let text = args.join(" ").trim();

    if (isAdmin) {
      const mentionIDs = Object.keys(mentions || {});

      if (mentionIDs.length) {
        targetID = String(mentionIDs[0]);
        for (const id of mentionIDs) text = text.split(mentions[id]).join("");
        text = text.replace(/\s+/g, " ").trim();
      } else if (messageReply) {
        targetID = String(messageReply.senderID);
      } else if (/^\d{8,}$/.test(args[0] || "")) {
        targetID = args[0];
        text = args.slice(1).join(" ").trim();
      }
    }

    const toSelf = targetID === String(senderID);

    if (!toSelf && !text) {
      return message.reply("❌ Please write the message you want to send.");
    }

    if (!text) text = "Hello! You asked me to message your inbox. 👋";

    let body;
    if (toSelf) {
      body =
        `╭─〔 📩 𝐈𝐍𝐁𝐎𝐗 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 〕─╮\n` +
        `│ 💬 ${text}\n` +
        `╰──────────────────╯`;
    } else {
      const senderName = (await usersData.getName(senderID)) || "Admin";
      body =
        `╭─〔 📩 𝐈𝐍𝐁𝐎𝐗 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 〕─╮\n` +
        `│ 👤 𝐅𝐫𝐨𝐦  ─> ${senderName}\n` +
        `│ 💬 ${text}\n` +
        `╰──────────────────╯`;
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let info;
    try {
      info = await sendToInbox(api, body, targetID);
    } catch (err) {
      console.error("[inbox] send failed:", util.inspect(err, { depth: 2 }));
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply(
        `❌ Couldn't deliver the message.\n` +
        `Reason: ${getErrorText(err)}\n\n` +
        `💡 The user must have an E2EE chat with the bot (message the bot in inbox first).`
      );
    }

    console.log("[inbox] target:", targetID, "result:", util.inspect(info, { depth: 2 }));

    const sentID = getMessageID(info);
    const apiError = info && typeof info === "object" ? (info.error || info.errorSummary || info.errorDescription) : null;

    if (apiError) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply(`❌ Couldn't deliver the message.\nReason: ${getErrorText(apiError)}`);
    }

    if (!sentID) {
      api.setMessageReaction("⚠️", messageID, () => {}, true);
      return message.reply(
        "⚠️ Facebook accepted the request but gave no delivery confirmation.\n" +
        "Check your inbox. If it's empty, message the bot in inbox once, then try again."
      );
    }

    api.setMessageReaction("✅", messageID, () => {}, true);
    if (event.isGroup) {
      return message.reply(
        toSelf
          ? "✅ Message sent to your inbox."
          : "✅ Message sent to the user's inbox."
      );
    }
  }
};
