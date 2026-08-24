const os = require('os');

module.exports = {
  config: {
    name: 'uptime2',
    aliases: ['upt2', 'statu', 'system', 'rtm'],
    version: '1.6',
    author: '𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot uptime and system stats with animation',
    category: 'system'
  },

  onStart: async function ({ message, event, usersData, threadsData, api }) {

    if (this.config.author !== '𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡') {
      return message.reply("⚠ Unauthorized author change detected.");
    }

    const startTime = Date.now();

    try {

      const users = await usersData.getAll();
      const groups = await threadsData.getAll();
      const uptime = process.uptime();

      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      const usedMemoryGB = (usedMemory / 1024 / 1024 / 1024).toFixed(2);
      const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);

      const cpuUsage = os.loadavg().map(v => v.toFixed(2)).join(', ');
      const cpuCores = os.cpus().length;
      const cpuModel = os.cpus()[0].model;

      const nodeVersion = process.version;
      const platform = os.platform();

      const ping = Date.now() - startTime;

      const bangladeshTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
      });

      const mediaBan =
        await threadsData.get(event.threadID, "mediaBan") || false;

      const mediaBanStatus = mediaBan
        ? "🚫 Media banned"
        : "✅ Media allowed";


      const segments = [

`🖥 SYSTEM STATS

⏱ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
💾 Memory: ${usedMemoryGB}/${totalMemoryGB} GB`,

`🧠 CPU: ${cpuModel}
⚙ Cores: ${cpuCores}
📊 Load: ${cpuUsage}`,

`📦 Node: ${nodeVersion}
💻 Platform: ${platform}
📶 Ping: ${ping}ms`,

`👥 Users: ${users.length}
👨‍👩‍👧 Groups: ${groups.length}

${mediaBanStatus}`,

`🕒 Time:
${bangladeshTime}

✅ SYSTEM READY`
      ];


      const frames = [
"LOADING [▒▒▒▒▒▒▒▒▒]",
"LOADING [██▒▒▒▒▒▒▒]",
"LOADING [████▒▒▒▒▒]",
"LOADING [██████▒▒▒]",
"LOADING [█████████]"
      ];


      const sent = await message.reply("Starting...");

      let i = 0;

      const interval = setInterval(() => {

        if (i >= segments.length) {
          clearInterval(interval);
          return;
        }

        api.editMessage(

`${frames[i]}

${segments.slice(0, i + 1).join("\n\n")}`,

sent.messageID

        );

        i++;

      }, 1000);


    } catch (e) {

      console.log(e);

      message.reply("Error getting stats");

    }

  }

};
