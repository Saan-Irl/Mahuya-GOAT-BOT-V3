const axios = require("axios");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["img2prompt", "cap"],
    version: "5.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    countDown: 5,
    role: 0,
    shortDescription: "Generates a prompt from image",
    category: "AI & IMAGE GENERATION",
    guide: "{pn} [reply to image]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/prompt";

    let imageUrl;
    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    } else {
      return api.sendMessage("╭─❍\n│ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾!\n╰───────────⟡", threadID, messageID);
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      const res = await axios.post(API_URL, {
        imageUrl: imageUrl
      });

      if (res.data.status === "success") {
        const prompt = res.data.data.prompt;
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`${prompt}`, threadID, messageID);
      } else {
        throw new Error("Invalid API Response");
      }
    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Failed to analyze the image!", threadID, messageID);
    }
  }
};
