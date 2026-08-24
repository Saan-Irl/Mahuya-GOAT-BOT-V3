module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "git"],
    version: "2.0",
    author: "𝗦𝗔𝗔𝗡 𝗘𝗫𝗛𝗔𝗨𝗦𝗧𝗘𝗗",
    countDown: 3,
    role: 0,
    longDescription: "Get the official Maiko bot repository link",
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {

    const text = `
[ 𝗦𝗔𝗔𝗡 𝗘𝗫𝗛𝗔𝗨𝗦𝗧𝗘𝗗 MAIN REPOSITORY ]

> Fork Link:
https://github.com

> Node Version : v25.9.0 ⚙️
> Status       : All Fixed ✔️
> Visibility   : Hidden 👁️‍🗨️

[ Customize System Port 🌪️ ]
`;

    message.reply(text);
  }
};
