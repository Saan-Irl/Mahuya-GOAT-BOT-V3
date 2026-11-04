const axios = require("axios");

const REPO_OWNER = "";
const REPO_NAME = "";
const REPO_LINK = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const REPO_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

module.exports = {
  config: {
    name: "fork",
    version: "4.5",
    author: "Saan",
    countDown: 5,
    role: 0,
    shortDescription: "Show github repository link ",
    category: "utility",
    guide: {
      en: "{p}fork"
    }
  },

  langs: {
    en: {
      current: `🐐 𝗚𝗢𝗔𝗧-𝗕𝗢𝗧-𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n━━━━━━━━━━━━━━━━━━━━\n⭐ ▰▰▰▰▰▰▰▱▱▱  %2 Stars\n🍴 ▰▰▰▰▰▰▰▰▰▱  %3 Forks\n━━━━━━━━━━━━━━━━━━━━\n🔗 %1\n👑 Maintained by  Saan`
    }
  },

  onStart: async function ({ message, getLang }) {
    const { stars, forks } = await getRepoStats();
    return message.reply(getLang("current", REPO_LINK, stars, forks));
  },

  onChat: async function ({ message, getLang, event }) {
    if (event.body && event.body.toLowerCase() === "fork") {
      const { stars, forks } = await getRepoStats();
      return message.reply(getLang("current", REPO_LINK, stars, forks));
    }
  }
};

async function getRepoStats() {
  try {
    const { data } = await axios.get(REPO_API, { timeout: 10000 });
    return {
      stars: data.stargazers_count ?? "N/A",
      forks: data.forks_count ?? "N/A"
    };
  } catch (error) {
    return { stars: "N/A", forks: "N/A" };
  }
}
