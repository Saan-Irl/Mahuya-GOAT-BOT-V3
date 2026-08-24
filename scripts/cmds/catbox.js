const axios = require("axios");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cb"],
    version: "3.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    countDown: 3,
    role: 0,
    shortDescription: "Upload media to Catbox",
    category: "tools",
    guide: "{pn} [reply to any media]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/catbox";

    if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
      return api.sendMessage("╭─❍\n│ Please reply to a Photo, Video, GIF, or Audio!\n╰───────────⟡", threadID, messageID);
    }

    const attachment = messageReply.attachments[0];
    const mediaUrl = attachment.url;

    const waitMsg = await api.sendMessage("Uploading...", threadID, messageID);

    try {
      const res = await axios.post(API_URL, {
        url: mediaUrl
      });

      const catboxUrl = res.data.url || res.data.data?.url || res.data.result;

      if (catboxUrl) {
        return api.editMessage(catboxUrl, waitMsg.messageID);
      } else {
        throw new Error();
      }
    } catch (error) {
      return api.editMessage("✕ Failed to upload!", waitMsg.messageID);
    }
  }
};
