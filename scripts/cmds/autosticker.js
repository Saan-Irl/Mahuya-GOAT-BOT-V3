module.exports = {
  config: {
    name: "autosticker",
    version: "4.5",
    author: "Siam Ahmed Saan",
    countDown: 1,
    role: 0,
    description: "Send a random sticker, view total count, or view all IDs.",
    category: "no prefix",
    guide: ""
  },

  onChat: async function ({ api, event }) {
    const { attachments, type, threadID, messageID, body } = event;

    const stickerList = [
      "997237917529747", "610031329418350", "610502019371281", "610569272697889", 
      "610569976031152", "476425823021014", "476426593020937", "476429343020662", 
      "476425429687720", "1303078524468983", "1303078351135667", "1303076361135866", 
      "1303077221135780", "587748556953567", "587538733641216", "587532536975169", 
      "587534000308356", "8298078730277844", "2041012262792914", "788171644590353", 
      "2041021119458695", "456545803421865", "2041015016125972", "456536873422758", 
      "456539756755803", "456538446755934", "456537923422653", "551710548197410", 
      "3258106924322842", "3258108400989361", "529234074205621", "2041012539459553", 
      "2041012109459596", "2041011389459668", "2041011836126290", "2041012406126233"
    ];

    if (body && body.toLowerCase() === "autosticker list") {
      return api.sendMessage(`📊 Total stickers: ${stickerList.length}`, threadID, messageID);
    }

    if (body && body.toLowerCase() === "autosticker listall") {
      let msg = "📜 𝗔𝗹𝗹 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗜𝗗𝘀\n━━━━━━━━━━━━━━━━━━━━\n";
      stickerList.forEach((id, index) => {
        msg += `${index + 1}. ${id}\n`;
      });
      msg += `\n📊 𝗧𝗼𝘁𝗮𝗹: ${stickerList.length}`;
      return api.sendMessage(msg, threadID, messageID);
    }

    if (type === "message" && attachments && attachments[0] && attachments[0].type === "sticker") {
      const randomSticker = stickerList[Math.floor(Math.random() * stickerList.length)];
      return api.sendMessage({
        sticker: randomSticker
      }, threadID, messageID);
    }
  },

  onStart: async function ({}) {
  }
};
