const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_CONFIG_URL = "https://raw.githubusercontent.com/goatbotnx/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";
let apiBaseUrl = null;
let apiConfigRequest = null;

async function getApiBaseUrl() {
  if (apiBaseUrl) return apiBaseUrl;

  if (!apiConfigRequest) {
    apiConfigRequest = axios
      .get(API_CONFIG_URL, { timeout: 15000 })
      .then(({ data }) => {
        const baseUrl = data?.[API_KEY];

        if (typeof baseUrl !== "string" || !baseUrl.trim()) {
          throw new Error(`Missing API key in apis.json: ${API_KEY}`);
        }

        apiBaseUrl = baseUrl.replace(/\/+$/, "");
        return apiBaseUrl;
      })
      .finally(() => {
        apiConfigRequest = null;
      });
  }

  return apiConfigRequest;
}

const RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

module.exports = {
  config: {
    name: "nanobanana",
    aliases: ["nb"],
    version: "1.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 10,
    role: 0,
    shortDescription: "Generate or edit images using Nano Banana AI",
    longDescription: "Generate or edit high-quality images using Nano Banana AI (reply to an image to edit)",
    category: "AI",
    guide: {
      en:
        "{pn} <prompt> → generate image (default ratio 1:1)\n" +
        "{pn} <prompt> --ar 16:9 → generate with specific ratio\n" +
        "{pn} <prompt> (reply to an image) → edit that image\n" +
        "{pn} <prompt> --ar 9:16 (reply to an image) → edit image with specific ratio\n" +
        "Available ratios: 1:1, 16:9, 9:16, 4:3, 3:4"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    let ratio = "1:1";
    const ratioIdx = args.findIndex(a => a === "--ar" || a === "-ar" || a === "--ratio" || a === "-r");
    if (ratioIdx !== -1 && args[ratioIdx + 1]) {
      const req = args[ratioIdx + 1];
      if (RATIOS.includes(req)) ratio = req;
      args.splice(ratioIdx, 2);
    }

    const prompt = args.join(" ").trim();
    const hasImage = event.messageReply && event.messageReply.attachments?.length > 0 &&
      event.messageReply.attachments[0].type === "photo";

    if (!prompt) {
      return api.sendMessage(
        "Please provide a prompt.\n" +
        "• Generate: nanobanana a cute cat\n" +
        "• Edit: reply to an image with nanobanana make it anime style",
        threadID,
        messageID
      );
    }

    try {
      api.setMessageReaction(hasImage ? "✏️" : "🎨", messageID, () => {}, true);

      const base = await getApiBaseUrl();
      let url = `${base}/api/nb?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;

      if (hasImage) {
        const imgUrl = event.messageReply.attachments[0].url;
        url += `&image=${encodeURIComponent(imgUrl)}`;
      }

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 120000,
        validateStatus: () => true
      });

      const contentType = response.headers["content-type"] || "";

      if (!contentType.includes("image")) {
        let errMsg = "Failed to generate image.";
        try {
          const json = JSON.parse(Buffer.from(response.data).toString());
          if (json.message) errMsg = json.message;
        } catch {}
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(errMsg, threadID, messageID);
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `nb_${event.senderID}_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage({
        body: hasImage
          ? `𝗡𝗔𝗡𝗢𝗕𝗔𝗡𝗔𝗡𝗔 𝗘𝗗𝗜𝗧𝗘𝗗 ✏️\n📐 Ratio: ${ratio}`
          : `𝗡𝗔𝗡𝗢𝗕𝗔𝗡𝗔𝗡𝗔 𝗔𝗜 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 🎨\n📐 Ratio: ${ratio}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Failed: " + error.message, threadID, messageID);
    }
  }
};
