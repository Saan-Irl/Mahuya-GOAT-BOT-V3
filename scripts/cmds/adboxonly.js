module.exports = {
	config: {
		name: "adminboxonly",
		aliases: ["onlyadbox", "adboxonly"],
		version: "1.5",
		author: "NTKhang (fixed)",
		countDown: 5,
		role: 1,
		description: {
			vi: "bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			en: "turn on/off only admin box can use bot"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [on | off]: bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot"
				+ "\n   {pn} status: xem trạng thái hiện tại"
				+ "\n   {pn} noti [on | off]: bật/tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
			en: "   {pn} [on | off]: turn on/off the mode only admin of group can use bot"
				+ "\n   {pn} status: show current status"
				+ "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin of group use bot"
		}
	},

	langs: {
		vi: {
			turnedOn: "Đã bật chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			turnedOff: "Đã tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			turnedOnNoti: "Đã bật thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
			turnedOffNoti: "Đã tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
			statusOn: "Chế độ chỉ quản trị viên nhóm: BẬT",
			statusOff: "Chế độ chỉ quản trị viên nhóm: TẮT",
			syntaxError: "Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off"
		},
		en: {
			turnedOn: "Turned on the mode only admin of group can use bot",
			turnedOff: "Turned off the mode only admin of group can use bot",
			turnedOnNoti: "Turned on the notification when user is not admin of group use bot",
			turnedOffNoti: "Turned off the notification when user is not admin of group use bot",
			statusOn: "Only-admin-box mode: ON",
			statusOff: "Only-admin-box mode: OFF",
			syntaxError: "Syntax error, only use {pn} on or {pn} off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		const { threadID } = event;
		const SELF = "onlyadminbox"; 
		const ensureSelfIgnored = async () => {
			const ignoreList = await threadsData.get(threadID, "data.ignoreCommanToOnlyAdminBox", []);
			if (!ignoreList.includes(SELF)) {
				ignoreList.push(SELF);
				await threadsData.set(threadID, ignoreList, "data.ignoreCommanToOnlyAdminBox");
			}
		};
		await ensureSelfIgnored();

		const sub = (args[0] || "").toLowerCase();

		if (sub == "status") {
			const current = await threadsData.get(threadID, "data.onlyAdminBox", false);
			return message.reply(current === true ? getLang("statusOn") : getLang("statusOff"));
		}

		let isSetNoti = false;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (sub == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		const arg = (args[indexGetVal] || "").toLowerCase();
		let value;
		if (arg == "on")
			value = true;
		else if (arg == "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		await threadsData.set(threadID, isSetNoti ? !value : value, keySetData);

		if (isSetNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
		else
			return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	}
};
