const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "mj",
    aliases: ["midjourney"],
    version: "4.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    countDown: 10,
    role: 0,
    shortDescription: "Generate 4 Midjourney images",
    longDescription: "Generates 4 images and sends them directly as attachments",
    category: "AI & IMAGE GENERATION",
    guide: "{pn} [your prompt]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("✨ Please enter a prompt!", threadID, messageID);
    }

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    api.setMessageReaction("⏳", messageID, () => {}, true);
    const startTime = Date.now();

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    };

    try {
      const mjApi = `https://xalman-apis.vercel.app/api/mj?prompt=${encodeURIComponent(prompt)}`;
      const { data: mjData } = await axios.get(mjApi);
      const images = mjData.images;

      if (!images || images.length < 1) {
        throw new Error("API returned no images.");
      }

      const attachments = [];
      const imageLinks = [];

      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i].url;
        imageLinks.push(imageUrl);

        const hostUrl = `https://xalman-apis.vercel.app/api/imghost?url=${encodeURIComponent(imageUrl)}`;
        const hostRes = await axios.get(hostUrl);
        const finalUrl = hostRes.data.success ? hostRes.data.data.url : imageUrl;
        const imgPath = path.join(cacheDir, `mj_${Date.now()}_${i}.png`);
        const imgRes = await axios.get(finalUrl, { responseType: 'arraybuffer', headers });
        fs.writeFileSync(imgPath, Buffer.from(imgRes.data));
        attachments.push(fs.createReadStream(imgPath));
      }

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage({
        body: `📝 Prompt: ${prompt}\n⏱️ Time: ${timeTaken}s\n━━━━━━━━━━━━━━━━━━━━\nHere are your generated images:`,
        attachment: attachments
      }, threadID, () => {
        attachments.forEach(file => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }, messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`⚠️ Error`, threadID, messageID);
    }
  }
};
