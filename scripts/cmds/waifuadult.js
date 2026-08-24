const axios = require("axios");

module.exports = {
  config: {
    name: "waifuadult",
    aliases: ["anihot", "pnx", "noughti"],
    version: "2.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    countDown: 6,
    role: 0,
    shortDescription: "Get anime nsfw image",
    longDescription: "Fetch direct image from API",
    category: "ANIME & MEDIA",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get("https://xalman-apis.vercel.app/api/waifuadult", {
        responseType: "stream"
      });

      return api.sendMessage({
        body: "😋𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗮𝗱𝘂𝗹𝘁 𝗮𝗻𝗶𝗺𝗲 𝗶𝗺𝗮𝗴𝗲🫦💋",
        attachment: response.data
      }, event.threadID, event.messageID);

    } catch (error) {
      return api.sendMessage("Error fetching image.", event.threadID);
    }
  }
};
