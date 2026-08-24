const fs = require("fs");

module.exports = {
  config: {
    name: "stats",
    aliases: ["botstats", "status"],
    version: "1.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    role: 0,
    shortDescription: "Shows total users and groups of the bot",
    longDescription: "Fetches total users and total groups/threads where the bot is added.",
    category: "owner"
  },

  onStart: async function({ api, event, args, usersData, threadsData, Threads }) {
    try {
      // ----- USERS COUNT -----
      let usersCount = 0;

      // Method 1: usersData.getAll()
      if (usersData && typeof usersData.getAll === "function") {
        const allUsers = await usersData.getAll();
        if (Array.isArray(allUsers)) usersCount = allUsers.length;
        else if (allUsers && typeof allUsers === "object") usersCount = Object.keys(allUsers).length;
      }
      // Method 2: global.users fallback
      else if (global.users && typeof global.users === "object") {
        usersCount = Object.keys(global.users).length;
      }
      // Method 3: fallback file read
      else {
        try {
          const raw = fs.readFileSync("./data/users.json", "utf8");
          const parsed = JSON.parse(raw);
          usersCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
        } catch (e) {
          usersCount = 0;
        }
      }

      // ----- GROUPS / THREADS COUNT -----
      let groupsCount = 0;

      // Method A: threadsData.getAll()
      if (threadsData && typeof threadsData.getAll === "function") {
        const allThreads = await threadsData.getAll();
        if (Array.isArray(allThreads)) groupsCount = allThreads.length;
        else if (allThreads && typeof allThreads === "object") groupsCount = Object.keys(allThreads).length;
      }
      // Method B: Threads.getAll()
      else if (Threads && typeof Threads.getAll === "function") {
        const all = await Threads.getAll();
        groupsCount = Array.isArray(all) ? all.length : Object.keys(all || {}).length;
      }
      // Method C: API getThreadList fallback
      else if (api && typeof api.getThreadList === "function") {
        try {
          const list = await new Promise((resolve, reject) => {
            api.getThreadList(100, null, (err, data) => {
              if (err) return reject(err);
              resolve(data || []);
            });
          });
          groupsCount = Array.isArray(list) ? list.length : 0;
        } catch (e) {}
      }
      // Method D: threads.json fallback
      if (groupsCount === 0) {
        try {
          const raw = fs.readFileSync("./data/threads.json", "utf8");
          const parsed = JSON.parse(raw);
          groupsCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed || {}).length;
        } catch (e) {}
      }

      const msg = `📊 Bot Statistics\n\n👤 Total Users: ${usersCount}\n👥 Total Groups/Threads: ${groupsCount}\n\n owner : 𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡`;
      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      console.error("Stats command error:", error);
      return api.sendMessage("Error: Unable to fetch bot stats.", event.threadID, event.messageID);
    }
  }
};
