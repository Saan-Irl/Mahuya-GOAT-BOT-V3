module.exports = {
  config: {
    name: "tag",
    aliases: ["all", "everyone"],
    category: "box chat",
    role: 0,
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    countDown: 3,
    description: {
      en: "Tag by reply, name or tag all members"
    },
    guide: {
      en: "{pm}tag [name] [msg]\n{pm}tag all [msg]\nReply + {pm}tag [msg]"
    }
  },

  onStart: async ({ api, event, usersData, threadsData, args }) => {
    const { threadID, messageID, messageReply } = event;

    try {
      const threadData = await threadsData.get(threadID);

      const members = threadData.members
        .filter(m => m.inGroup === true)
        .map(m => ({
          name: m.name,
          id: m.userID
        }));

      let tagUsers = [];
      let text = "";
      
      if (messageReply) {
        const uid = messageReply.senderID;
        const name = await usersData.getName(uid);
        tagUsers.push({ name, id: uid });
        text = args.join(" ");
      }

      else if (args[0] && ["all", "cdi"].includes(args[0].toLowerCase())) {
        tagUsers = members;
        text = args.slice(1).join(" ");
      }

      else {
        if (!args[0]) {
          return api.sendMessage(
            "⚠️ Name / reply / tag all",
            threadID,
            messageID
          );
        }

        const searchName = args[0].toLowerCase();
        text = args.slice(1).join(" ");

        tagUsers = members.filter(m =>
          m.name.toLowerCase().includes(searchName)
        );

        if (tagUsers.length === 0) {
          return api.sendMessage("❌ User Not Found", threadID, messageID);
        }
      }

      const mentions = tagUsers.map(u => ({
        tag: u.name,
        id: u.id
      }));

      const namesText = tagUsers.map(u => u.name).join(", ");
      const body = text ? `${namesText}\n${text}` : namesText;

      api.sendMessage(
        { body, mentions },
        threadID,
        messageReply ? messageReply.messageID : messageID
      );

    } catch (err) {
      api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};
