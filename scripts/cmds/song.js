const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const API_CONFIG_URL = "https://raw.githubusercontent.com/xalmandevv/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";
const CACHE_DIR = path.join(__dirname, "cache");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36";

let apiBaseUrl = null;
let apiConfigRequest = null;

async function getApiBaseUrl() {
  if (apiBaseUrl) return apiBaseUrl;

  if (!apiConfigRequest) {
    apiConfigRequest = axios
      .get(API_CONFIG_URL, { timeout: 15000 })
      .then(({ data }) => {
        const baseUrl = data?.[API_KEY];

        if (typeof baseUrl !== "string" || !baseUrl.trim()) {
          throw new Error(`Missing API key in apis.json: ${API_KEY}`);
        }

        apiBaseUrl = baseUrl.replace(/\/+$/, "");
        return apiBaseUrl;
      })
      .finally(() => {
        apiConfigRequest = null;
      });
  }

  return apiConfigRequest;
}

function getFfmpegPath() {
  try {
    return require("ffmpeg-static") || "ffmpeg";
  } catch {
    return "ffmpeg";
  }
}

function convertToMp3(inputUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-protocol_whitelist", "file,http,https,tcp,tls,crypto",
      "-user_agent", USER_AGENT,
      "-headers", "Referer: https://soundcloud.com/\r\n",
      "-i", inputUrl,
      "-vn",
      "-c:a", "libmp3lame",
      "-b:a", "128k",
      outputPath
    ];

    const ffmpeg = spawn(getFfmpegPath(), args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";

    const timer = setTimeout(() => {
      ffmpeg.kill("SIGKILL");
      reject(new Error("Audio conversion timed out"));
    }, 120000);

    ffmpeg.stderr.on("data", (chunk) => {
      stderr = (stderr + chunk.toString()).slice(-600);
    });

    ffmpeg.on("error", (error) => {
      clearTimeout(timer);
      reject(error.code === "ENOENT" ? new Error("ffmpeg not found. Run: npm i ffmpeg-static") : error);
    });

    ffmpeg.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) return resolve();
      reject(new Error(`Audio conversion failed (${code}). ${stderr.split("\n").filter(Boolean).pop() || ""}`.trim()));
    });
  });
}

module.exports = {
  config: {
    name: "song",
    version: "5.0",
    author: "Inno Alt",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Search and play a song from SoundCloud"
    },
    longDescription: {
      en: "Fetches a matching song and sends the audio"
    },
    category: "MEDIA",
    guide: {
      en: "{pn} <song name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage(
        "❌ Please enter a song name.\nExample: /song Happy Nation",
        threadID,
        messageID
      );
    }

    const filePath = path.join(CACHE_DIR, `song_${senderID}_${Date.now()}.mp3`);

    try {
      api.setMessageReaction("🎵", messageID, () => {}, true);
      fs.mkdirSync(CACHE_DIR, { recursive: true });

      const { data } = await axios.get(
        `${await getApiBaseUrl()}/api/scdlv2?query=${encodeURIComponent(query)}`,
        {
          timeout: 20000,
          headers: { "User-Agent": "Mozilla/5.0" }
        }
      );

      if (!data?.status || !data?.result?.download_url) {
        throw new Error(data?.message || "Song not found");
      }

      const title = data.result.title || query;

      await convertToMp3(data.result.download_url, filePath);

      const result = await api.sendMessage(
        {
          body: `🎧 ${title}`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        messageID
      );

      api.setMessageReaction("✅", messageID, () => {}, true);

      return result;

    } catch (error) {
      console.error("SONG ERROR:", error);

      api.setMessageReaction("❌", messageID, () => {}, true);

      return api.sendMessage(
        `❌ Failed to fetch song\n\n${error.message || "Unknown error"}`,
        threadID,
        messageID
      );
    } finally {
      setTimeout(() => fs.unlink(filePath, () => {}), 15000);
    }
  }
};
