const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
        config: {
                name: "pfp",
                aliases: ["avatar", "profilepic"],
                version: "1.0",
                author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
                countDown: 5,
                role: 0,
                description: {
                        vi: "Lấy ảnh đại diện của người dùng",
                        en: "Fetch user's profile picture"
                },
                category: "utility",
                guide: {
                        vi: '   {pn}: Lấy ảnh đại diện của bạn'
                                + '\n   {pn} <@tag>: Lấy ảnh đại diện của người được tag'
                                + '\n   {pn} <uid>: Lấy ảnh đại diện từ UID'
                                + '\n   {pn} <profile_link>: Lấy ảnh đại diện từ link profile'
                                + '\n   (Hoặc reply tin nhắn của ai đó)',
                        en: '   {pn}: Fetch your profile picture'
                                + '\n   {pn} <@tag>: Fetch tagged user\'s profile picture'
                                + '\n   {pn} <uid>: Fetch profile picture from UID'
                                + '\n   {pn} <profile_link>: Fetch profile picture from profile link'
                                + '\n   (Or reply to someone\'s message)'
                }
        },

        langs: {
                vi: {
                        fetching: "🔍 Đang lấy ảnh đại diện...",
                        success: "✓ Ảnh đại diện của %1",
                        error: "× Không thể lấy ảnh đại diện: %1",
                        invalidUID: "! UID không hợp lệ"
                },
                en: {
                        fetching: "🔍 Fetching profile picture...",
                        success: "✓ Profile picture of %1",
                        error: "× Could not fetch profile picture: %1",
                        invalidUID: "! Invalid UID"
                }
        },

        onStart: async function ({ api, message, args, event, getLang, usersData }) {
                try {
                        let uid = event.senderID;
                        
                        if (event.messageReply) {
                                uid = event.messageReply.senderID;
                        } else if (Object.keys(event.mentions).length > 0) {
                                uid = Object.keys(event.mentions)[0];
                        } else if (args[0]) {
                                if (!isNaN(args[0])) {
                                        uid = args[0];
                                } else if (args[0].includes("facebook.com/")) {
                                        const match = args[0].match(/(?:profile\.php\?id=|\/)([\d]+)/);
                                        if (match)
                                                uid = match[1];
                                        else {
                                                const vanityMatch = args[0].match(/facebook\.com\/([^/?]+)/);
                                                if (vanityMatch) {
                                                        try {
                                                                const response = await axios.get(`https://www.facebook.com/${vanityMatch[1]}`);
                                                                const uidMatch = response.data.match(/"userID":"(\d+)"/);
                                                                if (uidMatch)
                                                                        uid = uidMatch[1];
                                                        } catch (err) {
                                                                return message.reply(getLang("error", "Could not extract UID from link"));
                                                        }
                                                }
                                        }
                                }
                        }
                        
                        if (!uid || isNaN(uid))
                                return message.reply(getLang("invalidUID"));
                        
                        await message.reply(getLang("fetching"));
                        
                        const userName = await usersData.getName(uid);
                        const avatarURL = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                        
                        const cachePath = path.join(__dirname, "cache", `pfp_${uid}.jpg`);
                        await fs.ensureDir(path.dirname(cachePath));
                        
                        const response = await axios.get(avatarURL, { responseType: "arraybuffer" });
                        await fs.writeFile(cachePath, Buffer.from(response.data));
                        
                        await message.reply({
                                body: getLang("success", userName),
                                attachment: fs.createReadStream(cachePath)
                        });
                        
                        await fs.remove(cachePath);
                } catch (err) {
                        console.error("Error in pfp command:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};