const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};
// author change korle torpagolermarechudi 
module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
		category: "events"
	},

	langs: {

		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `✧ Hello {userName}.\n✧ Welcome {multiple} to {boxName}\n✧ Have a nice {session} 😊`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe") {

			const hours = getTime("HH");
			const { threadID } = event;
			const { nickNameBot } = global.GoatBot.config;
			const prefix = global.utils.getPrefix(threadID);
			const dataAddedParticipants = event.logMessageData.addedParticipants;

			// if new member is bot
			if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
				if (nickNameBot)
					api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());

				const ownerContactId =
					(global.GoatBot && global.GoatBot.config && global.GoatBot.config.ownerID) ||
					(global.config && (global.config.BOTOWNERID || global.config.BOTOWNER)) ||
					"100075454605535";

				const welcomeText = getLang("welcomeMessage", prefix);

				try {
					api.shareContact(welcomeText, String(ownerContactId), threadID);
				} catch (e) {
					message.send(welcomeText);
				}
				return;
			}

			// if new member:
			if (!global.temp.welcomeEvent[threadID])
				global.temp.welcomeEvent[threadID] = {
					joinTimeout: null,
					dataAddedParticipants: []
				};

			global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);

			clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

			global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
				const threadData = await threadsData.get(threadID);
				if (threadData.settings.sendWelcomeMessage == false)
					return;

				const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
				const dataBanned = threadData.data.banned_ban || [];
				const threadName = threadData.threadName;
				const userName = [],
					mentions = [];
				let multiple = false;

				if (dataAddedParticipants.length > 1)
					multiple = true;

				for (const user of dataAddedParticipants) {
					if (dataBanned.some((item) => item.id == user.userFbId))
						continue;
					userName.push(user.fullName);
					mentions.push({
						tag: user.fullName,
						id: user.userFbId
					});
				}

				if (userName.length == 0) return;

				let { welcomeMessage = getLang("defaultWelcomeMessage") } =
					threadData.data;

				const form = {
					mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
				};

				welcomeMessage = welcomeMessage
					.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
					.replace(/\{boxName\}|\{threadName\}/g, threadName)
					.replace(
						/\{multiple\}/g,
						multiple ? getLang("multiple2") : getLang("multiple1")
					)
					.replace(
						/\{session\}/g,
						hours <= 10
							? getLang("session1")
							: hours <= 12
								? getLang("session2")
								: hours <= 18
									? getLang("session3")
									: getLang("session4")
					);

				form.body = welcomeMessage;

				if (dataAddedParticipants.length === 1) {
					const newParticipant = dataAddedParticipants[0];
					try {
						api.shareContact(welcomeMessage, String(newParticipant.userFbId), threadID);
					} catch (e) {
						message.send(form);
					}
					delete global.temp.welcomeEvent[threadID];
					return;
				}

				if (threadData.data.welcomeAttachment) {
					const files = threadData.data.welcomeAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}

				message.send(form);
				delete global.temp.welcomeEvent[threadID];

			}, 1500);

		}
	}
};
