"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_CONFIG_URL = "https://raw.githubusercontent.com/xalmandevv/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";

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

const RATIOS = {
  "1:1": "1:1",
  "16:9": "16:9",
  "9:16": "9:16",
  "4:3": "4:3",
  "3:4": "3:4"
};

const MODELS = [
  { group: "GPT", name: "GPT Image 2", tag: "🧠", path: "/api/gptimage2", auto: false },
  { group: "GPT", name: "GPT Image 2.6 Sunburst", tag: "🌅", path: "/api/gpt2.6-sunburst", auto: true },
  { group: "GPT", name: "GPT Image 2.6 Flare", tag: "✨", path: "/api/gpt2.6-flare", auto: true },
  { group: "GPT", name: "GPT Image 2.5 Sunburst", tag: "🌅", path: "/api/gpt2.5-sunburst", auto: true },
  { group: "GPT", name: "GPT Image 2.5 Sunburst V2", tag: "🌅", path: "/api/gptimage2.5-sunburst-v2", auto: false },
  { group: "GPT", name: "GPT Image 2.5 Flare", tag: "✨", path: "/api/gpt2.5-flare", auto: true },
  { group: "GPT", name: "GPT Image 2.5 Flare V2", tag: "✨", path: "/api/gpt2.5-flare-v2", auto: false },
  { group: "Flux", name: "Flux 3", tag: "🔥", path: "/api/flux3", auto: true },
  { group: "Flux", name: "Flux 3 Klein", tag: "🔥", path: "/api/flux3-klein", auto: true },
  { group: "Flux", name: "Flux 2 Max", tag: "🔥", path: "/api/flux-2-max", auto: true },
  { group: "Grok", name: "Grok Imagine 2", tag: "⚡", path: "/api/grok-imagine", auto: true },
  { group: "Grok", name: "Grok Imagine Image", tag: "⚡", path: "/api/grok-imagine-image", auto: true },
  { group: "Nano Banana", name: "Nano Banana", tag: "🍌", path: "/api/nano-banana", auto: true },
  { group: "Nano Banana", name: "Nano Banana 2", tag: "🍌", path: "/api/nano-banana-2", auto: true },
  { group: "Qwen", name: "Qwen Image 3", tag: "🌀", path: "/api/qwen-image-3", auto: true },
  { group: "Qwen", name: "Qwen Image 2", tag: "🌀", path: "/api/qwen-image-2", auto: true },
  { group: "Qwen", name: "Qwen Image", tag: "🌀", path: "/api/qwen-image", auto: false },
  { group: "SeedDream", name: "SeedDream 4", tag: "🌱", path: "/api/seedream-v4", auto: true }
].map((m, i) => ({ ...m, id: i + 1, supportsImage: true }));

const TOTAL = MODELS.length;

function buildModelBox() {
  const rows = [];
  let lastGroup = null;

  for (const m of MODELS) {
    if (m.group !== lastGroup) {
      rows.push(`│ ━━ ${m.group} ━━`);
      lastGroup = m.group;
    }

    rows.push(`│ ${String(m.id).padStart(2, "0")}. ${m.tag} ${m.name}`);
  }

  return (
    "╭─〔 🤖 𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐌𝐎𝐃𝐄𝐋𝐒 〕─╮\n" +
    rows.join("\n") +
    "\n╰─────────────────────╯"
  );
}

module.exports = {
  config: {
    name: "genx",
    aliases: ["gnx"],
    version: "2.6",
    author: "Inno Alt",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: `Generate or edit images with ${TOTAL} AI models`
    },
    longDescription: {
      en: "Text-to-image or image-edit generation using multiple AI models"
    },
    category: "AI",
    guide: {
      en:
        `   {pn} --m <1-${TOTAL}> <prompt> --ar <ratio>\n` +
        `   Reply to an image + {pn} --m <1-${TOTAL}> <prompt> → edit that image\n\n` +
        buildModelBox() +
        "\n\n📐 Ratios: " + Object.keys(RATIOS).join(", ") + ", auto\n" +
        "🤖 Edit mode: without --ar, supported models pick auto ratio"
    }
  },

  onStart: async function ({ api, event, args, message, prefix, commandName }) {
    const { messageID } = event;

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    if (!args.length) {
      return message.reply(
        `╭─〔 🤖 𝐆𝐄𝐍𝐗 𝐈𝐌𝐀𝐆𝐄 𝐀𝐈 〕─╮\n` +
        `│ 📝 ${prefix}${commandName} --m <1-${TOTAL}> <prompt> --ar <ratio>\n` +
        `│ 🖼️ Reply to an image + command → edit mode\n` +
        `╰─────────────────────╯\n\n` +
        buildModelBox() +
        `\n\n📐 Ratios: ${Object.keys(RATIOS).join(", ")}, auto\n` +
        `🤖 Edit mode: without --ar, supported models pick auto ratio`
      );
    }

    let workingArgs = [...args];

    const mIndex = workingArgs.findIndex(a => a.toLowerCase() === "--m");
    let modelId = null;

    if (mIndex !== -1) {
      modelId = parseInt(workingArgs[mIndex + 1]);

      workingArgs = [
        ...workingArgs.slice(0, mIndex),
        ...workingArgs.slice(mIndex + 2)
      ];
    }

    const model = MODELS.find(m => m.id === modelId);

    if (!model) {
      return message.reply(
        `❌ Please choose a valid model with --m <1-${TOTAL}>.\n\n${buildModelBox()}`
      );
    }

    const arIndex = workingArgs.findIndex(a => a.toLowerCase() === "--ar");

    let ratio = "1:1";
    let ratioGiven = false;

    if (arIndex !== -1) {
      const ratioArg = workingArgs[arIndex + 1];

      if (ratioArg && ratioArg.toLowerCase() === "auto" && model.auto) {
        ratio = "auto";
        ratioGiven = true;
      } else if (ratioArg && RATIOS[ratioArg]) {
        ratio = RATIOS[ratioArg];
        ratioGiven = true;
      }

      workingArgs = [
        ...workingArgs.slice(0, arIndex),
        ...workingArgs.slice(arIndex + 2)
      ];
    }

    const prompt = workingArgs.join(" ").trim();

    if (!prompt) {
      return message.reply("❌ Please provide a prompt.");
    }

    const imageUrl =
      event.messageReply?.attachments?.find(a => a.type === "photo")?.url || null;

    const isEdit = Boolean(imageUrl && model.supportsImage);

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let filePath;

    try {
      const baseUrl = await getApiBaseUrl();
      const endpoint = `${baseUrl}${model.path}`;

      const sendRatio = model.auto && !ratioGiven ? undefined : ratio;

      const params = {
        prompt,
        ratio: sendRatio,
        image: model.supportsImage ? (imageUrl || "") : undefined
      };

      const res = await axios.get(endpoint, {
        params,
        timeout: 180000,
        responseType: "arraybuffer",
        validateStatus: () => true
      });

      const contentType = res.headers["content-type"] || "";
      const buffer = Buffer.from(res.data);

      const looksLikeJson =
        contentType.includes("json") ||
        contentType.includes("text") ||
        res.status >= 400;

      if (looksLikeJson) {
        let errMsg = `HTTP ${res.status} ${res.statusText || ""}`.trim();

        try {
          const errData = JSON.parse(buffer.toString("utf-8"));
          errMsg = errData?.message || errData?.error || errMsg;
        } catch {
          const snippet = buffer
            .toString("utf-8")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 150);

          if (snippet) errMsg = snippet;
        }

        api.setMessageReaction("❌", messageID, () => {}, true);

        return message.reply(`❌ ${model.name} failed: ${errMsg}`);
      }

      const magic = buffer.slice(0, 12).toString("hex");

      let ext = "jpg";

      if (magic.startsWith("89504e470d0a1a0a")) ext = "png";
      else if (magic.startsWith("ffd8ff")) ext = "jpg";
      else if (magic.startsWith("47494638")) ext = "gif";
      else if (
        magic.startsWith("52494646") &&
        magic.includes("57454250")
      ) ext = "webp";
      else if (contentType.includes("png")) ext = "png";
      else if (contentType.includes("gif")) ext = "gif";
      else if (contentType.includes("webp")) ext = "webp";

      const usedRatio = String(res.headers["x-ratio"] || ratio);

      const ratioLabel =
        usedRatio.toLowerCase() === "auto" ? "Auto" : usedRatio;

      filePath = path.join(cacheDir, `genx_${Date.now()}.${ext}`);

      await fs.writeFile(filePath, buffer);

      api.setMessageReaction("✅", messageID, () => {}, true);

      return message.reply({
        body:
          `╭─〔 🤖 𝐆𝐄𝐍𝐗 𝐑𝐄𝐒𝐔𝐋𝐓 〕─╮\n` +
          `│ ${model.tag} 𝐌𝐨𝐝𝐞𝐥   ─> ${model.name}\n` +
          `│ 📐 𝐑𝐚𝐭𝐢𝐨   ─> 「 ${ratioLabel} 」\n` +
          `│ 🎭 𝐌𝐨𝐝𝐞    ─> 『 ${isEdit ? "Edit" : "Text-to-Image"} 』\n` +
          `╰----------------------------─╯`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (err) {
      console.error("[genx] Error:", err.message);

      api.setMessageReaction("❌", messageID, () => {}, true);

      return message.reply(`❌ ${model.name} failed: ${err.message}`);

    } finally {
      if (filePath) fs.remove(filePath).catch(() => {});
    }
  }
};