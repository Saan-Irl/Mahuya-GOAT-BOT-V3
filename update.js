const https = require("https");

const REPO_OWNER = "Saan-Irl";
const REPO_NAME = "Mahuya-GOAT-BOT-V3";
const BRANCH = "main";

const UPDATER_URL =
`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/updater.js`;

https.get(UPDATER_URL, {
headers: {
"User-Agent": "Mahuya-GOAT-BOT-V3-Updater"
}
}, (res) => {
let data = "";

res.on("data", chunk => data += chunk);

res.on("end", () => {
if (res.statusCode !== 200) {
console.error(`✗ GitHub returned HTTP ${res.statusCode}`);
process.exitCode = 1;
return;
}

try {
eval(data);
} catch (error) {
console.error("✗ Failed to run updater.js");
console.error(`Reason: ${error.message}`);
process.exitCode = 1;
}
});
}).on("error", (error) => {
console.error("✗ Failed to download updater.js");
console.error(`Reason: ${error.message}`);
process.exitCode = 1;
});
