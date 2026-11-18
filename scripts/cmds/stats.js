const fs = require("fs");
const os = require("os");
const moment = require("moment-timezone");

function sendMsg(api, text, threadID) {
  return new Promise((resolve) => {
    api.sendMessage(text, threadID, (err, info) => {
      resolve(info);
    });
  });
}

function editMsg(api, text, messageID) {
  return new Promise((resolve) => {
    if (typeof api.editMessage !== "function") return resolve(false);
    api.editMessage(text, messageID, (err) => {
      resolve(!err);
    });
  });
}

module.exports = {
  config: {
    name: "stats",
    aliases: ["botstats"],
    version: "5.0",
    author: "Inno Alt",
    role: 0,
    shortDescription: "Shows detailed bot and system statistics",
    category: "SYSTEM"
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const { threadID } = event;

      const loadingMsg = await sendMsg(api, `╭───〔 📊 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 〕───╮\n│\n│ ░░░░░░░░░░ 0%\n│\n╰─────────────────────`, threadID);
      const loadingID = loadingMsg ? loadingMsg.messageID : null;

      if (loadingID) {
        const steps = [20, 50, 80, 100];
        for (const p of steps) {
          const filled = p / 10;
          const bar = "█".repeat(filled) + "░".repeat(10 - filled);
          await editMsg(api, `╭───〔 📊 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 〕───╮\n│\n│ ${bar} ${p}%\n│\n╰─────────────────────`, loadingID);
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }

      let usersCount = 0;
      let usersSizeMB = "0.00";
      if (usersData && typeof usersData.getAll === "function") {
        const allUsers = await usersData.getAll();
        usersCount = Array.isArray(allUsers) ? allUsers.length : Object.keys(allUsers || {}).length;
        usersSizeMB = (Buffer.byteLength(JSON.stringify(allUsers || {})) / 1024 / 1024).toFixed(2);
      }

      let groupsCount = 0;
      let groupsSizeMB = "0.00";
      if (threadsData && typeof threadsData.getAll === "function") {
        const allThreads = await threadsData.getAll();
        groupsCount = Array.isArray(allThreads) ? allThreads.length : Object.keys(allThreads || {}).length;
        groupsSizeMB = (Buffer.byteLength(JSON.stringify(allThreads || {})) / 1024 / 1024).toFixed(2);
      }

      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memPercentage = ((usedMemory / totalMemory) * 100).toFixed(1);
      const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);
      const usedMemoryGB = (usedMemory / 1024 / 1024 / 1024).toFixed(2);
      const memBar = "█".repeat(Math.round((usedMemory / totalMemory) * 10)) + "░".repeat(10 - Math.round((usedMemory / totalMemory) * 10));

      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model?.split('@')[0]?.trim() || "Unknown";
      const cpuCores = cpus.length;
      const cpuLoad = os.loadavg()[0].toFixed(2);

      const memoryUsage = process.memoryUsage();
      const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);

      const ping = Date.now() - event.timestamp || 0;

      const timeBD = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
      const dateBD = moment().tz("Asia/Dhaka").format("DD MMM YYYY");
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;

      const msg = 
`╭───〔 📊 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗦 〕───╮
│
│ 👤 𝗨𝘀𝗲𝗿𝘀      : ${usersCount}
│ 👥 𝗚𝗿𝗼𝘂𝗽𝘀     : ${groupsCount}
│ 💾 𝗨𝘀𝗲𝗿 𝗗𝗕    : ${usersSizeMB} MB
│ 💾 𝗚𝗿𝗼𝘂𝗽 𝗗𝗕   : ${groupsSizeMB} MB
│
├──〔 ⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘 〕──
│ ⏳ 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲  : ${uptimeString}
│ 📅 𝗗𝗮𝘁𝗲       : ${dateBD}
│ 🕒 𝗧𝗶𝗺𝗲       : ${timeBD}
│ 🏓 𝗣𝗶𝗻𝗴       : ${ping}ms
│
├──〔 💻 𝗦𝗬𝗦𝗧𝗘𝗠 〕──
│ 🖥️ 𝗢𝗦        : ${platform} (${arch})
│ ⚙️ 𝗖𝗣𝗨       : ${cpuModel} (${cpuCores} cores)
│ ⚡ 𝗟𝗼𝗮𝗱      : ${cpuLoad}%
│ 📦 𝗡𝗼𝗱𝗲      : ${nodeVersion}
│
├──〔 🧠 𝗠𝗘𝗠𝗢𝗥𝗬 〕──
│ 💾 𝗥𝗔𝗠       : [${memBar}] ${memPercentage}%
│ 📊 𝗨𝘀𝗲𝗱      : ${usedMemoryGB}GB / ${totalMemoryGB}GB
│ 🔋 𝗛𝗲𝗮𝗽      : ${heapUsedMB} MB
│ 📈 𝗥𝗦𝗦       : ${rssMB} MB
│
╰─────────────────────`;

      if (loadingID) {
        const edited = await editMsg(api, msg, loadingID);
        if (!edited) await sendMsg(api, msg, threadID);
      } else {
        await sendMsg(api, msg, threadID);
      }

    } catch (error) {
      console.error("Stats command error:", error);
      return api.sendMessage("❌ Error: Unable to fetch bot stats.\n" + error.message, event.threadID, event.messageID);
    }
  }
};
