"use strict";

const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "owner",
    aliases: ["admininfo", "info", "ownerinfo"],
    version: "4.1",
    author: "Mahuya Eclipse",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Mahuya Eclipse premium profile"
    },
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {

    const profile = {
      name: "Mahuya Eclipse",
      nickname: "Misty",
      age: "22",

      relationship: "Married",
      husband: "Siam Ahmed Saan",

      husbandFacebook:
        "https://www.facebook.com/siam.ahmed.491801",

      facebook:
        "https://www.facebook.com/mahuya.mou.143",

      instagram:
        "https://www.instagram.com/mahuya.exe?xtok=MXRucjAwYXZvb2xkaw==",

      youtube:
        "https://www.youtube.com/@MahuyaAdhikari-e8c",

      picture:
        "https://files.catbox.moe/h3e95f.jpg"
    };

    const timeBD = moment().tz("Asia/Dhaka");

    const infoMsg =
`╭━━━〔 𝑴𝑨𝑯𝑼𝒀𝑨 𝑬𝑪𝑳𝑰𝑷𝑺𝑬 〕━━━╮
┃
┃  ✦ 𝗣𝗘𝗥𝗦𝗢𝗡𝗔𝗟 𝗣𝗥𝗢𝗙𝗜𝗟𝗘
┃
┃  ♡ Name      : ${profile.name}
┃  ♡ Nickname  : ${profile.nickname}
┃  ♡ Age       : ${profile.age}
┃
┣━━━━━━━━━━━━━━━━━━━━
┃  💍 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣
┃
┃  ♡ Status    : ${profile.relationship}
┃  ♡ Husband   : ${profile.husband}
┃  ♡ Facebook  : ${profile.husbandFacebook}
┃
┣━━━━━━━━━━━━━━━━━━━━
┃  ✧ 𝗦𝗢𝗖𝗜𝗔𝗟 𝗣𝗥𝗘𝗦𝗘𝗡𝗖𝗘
┃
┃  ♡ Facebook  : ${profile.facebook}
┃  ♡ Instagram : ${profile.instagram}
┃  ♡ YouTube   : ${profile.youtube}
┃
┣━━━━━━━━━━━━━━━━━━━━
┃  ⏳ 𝗟𝗢𝗖𝗔𝗟 𝗧𝗜𝗠𝗘
┃
┃  ♡ Date : ${timeBD.format("DD MMMM, YYYY")}
┃  ♡ Time : ${timeBD.format("hh:mm:ss A")}
┃
╰━━━━━━━━━━━━━━━━━━━━╯

       𓆩 ♡ 𓆪
     𝑴𝑨𝑯𝑼𝒀𝑨 𝑬𝑪𝑳𝑰𝑷𝑺𝑬
       𝑴𝒀 𝑶𝑾𝑵 𝑾𝑶𝑹𝑳𝑫`;

    try {
      const attachment =
        await global.utils.getStreamFromURL(profile.picture);

      return message.reply({
        body: infoMsg,
        attachment
      });

    } catch (error) {
      console.error(
        "[MAHUYA PROFILE] Image Error:",
        error.message
      );

      return message.reply(infoMsg);
    }
  },

  onChat: async function ({ event, message }) {

    if (event.body?.trim().toLowerCase() === "info") {
      return this.onStart({ message, event });
    }
  }
};