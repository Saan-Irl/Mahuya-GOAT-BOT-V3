module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "git"],
    version: "2.0",
    author: "𝑴𝑨𝑯𝑼𝒀𝑨 𝑨𝑫𝑯𝑰𝑲𝑨𝑹𝑰",
    countDown: 3,
    role: 0,
    longDescription: "Get the official Maiko bot repository link",
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {

    const text = `
[ 𝗦𝗔𝗔𝗡 & 𝐌𝐀𝐇𝐔𝐘𝐀 𝐀𝐃𝐇𝐈𝐊𝐀𝐑𝐈 MAIN REPOSITORY ]

> Fork Link:
https://github.com/Saan-Irl/Mahuya-GOAT-BOT-V3

> Node Version : v25.9.0 ⚙️
> Status       : All Fixed ✔️
> Visibility   : Public 👁️‍🗨️

[ Customize System Port 🌪️ ]
`;

    message.reply(text);
  }
};
