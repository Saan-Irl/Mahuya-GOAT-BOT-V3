module.exports = {
config: {
name: "update",
version: "1.0",
author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
countDown: 5,
role: 2,
description: "Update system",
category: "owner"
},

onStart: async function ({ message }) {
return message.reply("⚠️ Update system is disabled.\n\nThis bot is no longer connected to the external updater.");
}
};
