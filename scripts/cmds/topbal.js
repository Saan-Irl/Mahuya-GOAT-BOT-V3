module.exports = {
  config: {
    name: "topbal",
    aliases: ["tp"],
    version: "1.1",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    role: 0,
    shortDescription: {
      en: "Top 15 Rich Users"
    },
    longDescription: {
      en: "Displays the top 15 richest users with their name, UID, and money"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    function formatMoney(amount) {
      if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} B💵`;
      if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)} M💵`;
      if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)} K💵`;
      return `${amount} 💵`;
    }

    const allUsers = await usersData.getAll();
    const topUsers = allUsers
      .sort((a, b) => b.money - a.money)
      .slice(0, 10);

    const topUsersList = topUsers.map((user, index) =>
      `${index + 1}. 🏅 Name: ${user.name}\n   🆔 UID: ${user.userID}\n   💰 Balance: ${formatMoney(user.money)}`
    );

    const messageText = `🎉 𝗧𝗢𝗣 𝟭𝟱 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 🎉\n\n${topUsersList.join('\n\n')}\n\n⚡ Keep earning and climb to the top! ⚡`;

    message.reply(messageText);
  }
};
