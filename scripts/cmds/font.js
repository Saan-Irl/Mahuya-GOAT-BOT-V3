"use strict";

const axios = require("axios");

const API_CONFIG_URL = "https://raw.githubusercontent.com/xalmandevv/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";

const BRAND = "Saan";

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
          throw new Error(`Missing API key: ${API_KEY}`);
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

module.exports = {
  config: {
    name: "font",
    aliases: ["fontstyle"],
    version: "5.4",
    author: "Inno Alt",
    countDown: 5,
    role: 0,
    shortDescription: "Generate stylish fonts & see list",
    category: "tools",
    guide: "{pn} [text] [style_id] or {pn} list"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    let API_URL;

    try {
      API_URL = `${await getApiBaseUrl()}/api/font`;
    } catch (err) {
      console.error("Font API configuration error:", err);
      return api.sendMessage("✕ API Error!", threadID, messageID);
    }

    // FONT STYLE LIST
    if (args[0]?.toLowerCase() === "list") {
      api.setMessageReaction("📜", messageID, () => {}, true);

      try {
        const res = await axios.get(
          `${API_URL}?text=${encodeURIComponent(BRAND)}&style=List`,
          { timeout: 30000 }
        );

        const previews = res.data.previews;

        if (!previews || typeof previews !== "object") {
          return api.sendMessage(
            "✕ Unable to fetch font styles!",
            threadID,
            messageID
          );
        }

        let listMsg =
          "𝗙𝗢𝗡𝗧 𝗦𝗧𝗬𝗟𝗜𝗦𝗧 𝗣𝗥𝗘𝗩𝗜𝗘𝗪\n" +
          "━━━━━━━━━━━━━━━━━━\n";

        for (const [id, text] of Object.entries(previews)) {
          listMsg += `${id}. ${text}\n`;
        }

        listMsg +=
          "━━━━━━━━━━━━━━━━━━\n" +
          "Usage: /font [text] [id]";

        return api.sendMessage(listMsg, threadID, messageID);

      } catch (err) {
        console.error("Font list error:", err);

        return api.sendMessage(
          "✕ API Error!",
          threadID,
          messageID
        );
      }
    }

    // FONT GENERATOR
    const styleID = args.pop();
    const text = args.join(" ");

    if (!text || !styleID || !/^\d+$/.test(styleID)) {
      return api.sendMessage(
        "Usage: /font [text] [style_id]\nExample: /font Saan 15",
        threadID,
        messageID
      );
    }

    try {
      api.setMessageReaction("✍️", messageID, () => {}, true);

      const res = await axios.get(
        `${API_URL}?text=${encodeURIComponent(text)}&style=${encodeURIComponent(styleID)}`,
        { timeout: 30000 }
      );

      if (res.data.status === false || !res.data.result) {
        return api.sendMessage(
          "✕ Invalid Style!",
          threadID,
          messageID
        );
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        res.data.result,
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Font generation error:", error);

      api.setMessageReaction("❌", messageID, () => {}, true);

      return api.sendMessage(
        "✕ API Error!",
        threadID,
        messageID
      );
    }
  }
};