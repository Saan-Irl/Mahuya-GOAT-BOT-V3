module.exports = {
	config: {
		name: "tid",
		version: "1.2",
		author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem id nhóm chat của bạn",
			en: "View threadID of your group chat"
		},
		category: "SYSTEM",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message, event }) {
		message.reply(event.threadID.toString());
	}
};