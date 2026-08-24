const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const encodedUrl = "aHR0cHM6Ly9yYXNpbi1hcGlzLm9ucmVuZGVyLmNvbQ==";
const encodedKey = "cnNfaGVpNTJjbTgtbzRvai11Y2ZjLTR2N2MtZzE=";

// Decode function
function decode(b64) {
 return Buffer.from(b64, "base64").toString("utf-8");
}

// Download image function
function downloadImage(url, filePath) {
 return new Promise((resolve, reject) => {
  const file = fs.createWriteStream(filePath);

  https.get(url, (res) => {
   if (res.statusCode !== 200) {
    return reject(new Error(`Image fetch failed: ${res.statusCode}`));
   }

   res.pipe(file);
   file.on("finish", () => {
    file.close();
    resolve();
   });
  }).on("error", (err) => {
   fs.unlink(filePath);
   reject(err);
  });
 });
}

module.exports = {
 config: {
  name: "needgf",
  version: "1.0.5",
  author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
  countDown: 20,
  role: 0,
  shortDescription: "Single der jonno GF 😆",
  longDescription: "Random GF image & caption pathay 😏",
  category: "fun",
  guide: {
   en: "{pn}"
  }
 },

 onStart: async function ({ api, event }) {
  try {
   const apiUrl = decode(encodedUrl);
   const apiKey = decode(encodedKey);

   const fullUrl = `${apiUrl}/api/rasin/gf?apikey=${apiKey}`;

   const res = await axios.get(fullUrl);

   const title = res.data?.data?.title || "Here is your GF 😆";
   const imgUrl = res.data?.data?.url;

   if (!imgUrl) throw new Error("No image URL found!");

   const imgPath = path.join(__dirname, "cache", `${event.senderID}_gf.jpg`);

   await downloadImage(imgUrl, imgPath);

   api.sendMessage(
    {
     body: title,
     attachment: fs.createReadStream(imgPath)
    },
    event.threadID,
    () => fs.unlinkSync(imgPath),
    event.messageID
   );

  } catch (err) {
   console.error("❌ Error:", err.message);
   api.sendMessage("⚠️ GF আনতে সমস্যা হইছে!", event.threadID, event.messageID);
  }
 }
};
