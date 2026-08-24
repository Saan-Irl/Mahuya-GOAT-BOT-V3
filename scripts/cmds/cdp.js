const axios = require("axios");

module.exports = {
  config: {
    name: "coupledp",
    aliases: ["cdp"],
    version: "4.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    description: "Random Matching Couple DP with auto-retry",
    category: "FUN AND SOCIAL",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/cdp";
    const MAX_RETRIES = 3;
    let attempt = 0;
    let success = false;

    api.setMessageReaction("⏳", messageID, () => {}, true);

    while (attempt < MAX_RETRIES && !success) {
      attempt++;
      try {
        const res = await axios.get(API_URL, { timeout: 10000 });
        const pair = res.data.pair;

        if (!pair || !pair.boy || !pair.girl) throw new Error("Invalid data from API");

        const getStream = async (url) => {
          const response = await axios.get(url, {
            responseType: "stream",
            timeout: 15000,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
              "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
              "Referer": "https://imgur.com/"
            }
          });
          return response.data;
        };

        const boyStream = await getStream(pair.boy);
        const girlStream = await getStream(pair.girl);

        await api.sendMessage({
          body: "❖ 𝐌𝐀𝐓𝐂𝐇𝐈𝐍𝐆 𝐂𝐎𝐔𝐏𝐋𝐄 𝐃𝐏 ❖\n━━━━━━━━━━━━━━━━━━\n",
          attachment: [boyStream, girlStream]
        }, threadID);

        api.setMessageReaction("✅", messageID, () => {}, true);
        success = true;
        break;

      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err.message);
        if (attempt === MAX_RETRIES) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage(`✕ Failed after ${MAX_RETRIES} attempts. Please try again later.`, threadID, messageID);
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
};
