const https = require("https");

const REPO_OWNER = "Saan-Irl";
const REPO_NAME = "Mahuya-GOAT-BOT-V3";
const BRANCH = "main";

const VERSION_URL =
  `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/update-version.json`;

const localVersion = require("./package.json").version;

function getRemoteVersion() {
  return new Promise((resolve, reject) => {
    https.get(VERSION_URL, {
      headers: {
        "User-Agent": "SAAN-GOAT-BOT-V3-Updater"
      }
    }, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`GitHub returned HTTP ${res.statusCode}`));
          }

          const info = JSON.parse(data);
          resolve(info);
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

(async () => {
  console.log("╔════════════════════════════════════╗");
  console.log("║       SAAN GOAT BOT V3 UPDATE      ║");
  console.log("╚════════════════════════════════════╝");
  console.log("");
  console.log(`Local version : ${localVersion}`);
  console.log(`Repository    : https://github.com/${REPO_OWNER}/${REPO_NAME}`);
  console.log("");
  console.log("Checking for updates...");

  try {
    const remote = await getRemoteVersion();

    console.log(`Remote version: ${remote.version}`);

    if (remote.version === localVersion) {
      console.log("");
      console.log("✓ You are already using the latest version.");
      return;
    }

    console.log("");
    console.log(`⚠ Update available: ${localVersion} → ${remote.version}`);
    console.log("");
    console.log("Automatic file replacement is currently disabled.");
    console.log("Please update the bot manually from your own repository.");
  } catch (error) {
    console.error("");
    console.error("✗ Could not check for updates.");
    console.error(`Reason: ${error.message}`);
    process.exitCode = 1;
  }
})();
