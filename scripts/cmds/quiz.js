"use strict";

const axios = require("axios");

const API_CONFIG_URL = "https://raw.githubusercontent.com/xalmandevv/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";

const BRAND = "Siam Ahmed Saan";
const REWARD = 3000;

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
          throw new Error(`Missing API key: ${API_KEY}`);
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

const CATEGORY_ALIASES = {
  bn: "bn",
  bangla: "bn",
  bengali: "bn",
  en: "en",
  english: "en",
  math: "math",
  maths: "math",
  mathematics: "math"
};

const CATEGORY_LABELS = {
  bn: "🇧🇩 Bangla",
  en: "🇬🇧 English",
  math: "🧮 Math"
};

function normalizeCategory(input) {
  if (!input) return null;
  return CATEGORY_ALIASES[String(input).toLowerCase().trim()] || null;
}

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "9.1",
    author: "Inno Alt",
    countDown: 5,
    role: 0,
    description: "Play a random quiz with elegant design and automatic clean-up",
    category: "GAMES",
    guide:
      "{pn} : random bangla quiz\n" +
      "{pn} bn / bangla : bangla quiz\n" +
      "{pn} en / english : english quiz\n" +
      "{pn} math : math quiz\n" +
      "{pn} list : total questions (all categories)\n" +
      "{pn} list <category> : total questions in a category"
  },

  onStart: async function ({ event, message, args, api }) {
    const { senderID } = event;

    let BASE_URL;

    try {
      BASE_URL = `${await getApiBaseUrl()}/api/quiz`;
    } catch (err) {
      console.error("Quiz API configuration error:", err);
      return message.reply(
        "❌ Unable to establish a connection with the quiz server."
      );
    }

    // QUIZ DATABASE LIST
    if (args[0] === "list" || args[0] === "total") {
      const rawCategory = args[1];
      const category = normalizeCategory(rawCategory);

      if (rawCategory && !category) {
        return message.reply(
          `❌ Invalid category: "${rawCategory}"\n` +
          "✅ Valid categories: bn/bangla, en/english, math"
        );
      }

      try {
        const url = category
          ? `${BASE_URL}?list=true&category=${category}`
          : `${BASE_URL}?list=true`;

        const res = await axios.get(url);
        const data = res.data;

        let listMsg;

        if (data.by_category) {
          listMsg =
            `📊 𝗤𝗨𝗜𝗭 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗖𝗦\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `📝 Total Questions: ${data.total_questions}\n` +
            `🇧🇩 Bangla: ${data.by_category.bn}\n` +
            `🇬🇧 English: ${data.by_category.en}\n` +
            `🧮 Math: ${data.by_category.math}\n` +
            `👤 Database Author: ${BRAND}\n` +
            `🟢 System Status: Active\n` +
            `━━━━━━━━━━━━━━━━━━`;
        } else {
          listMsg =
            `📊 𝗤𝗨𝗜𝗭 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗖𝗦 (${data.category})\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `📝 Total Questions: ${data.total_questions}\n` +
            `👤 Database Author: ${BRAND}\n` +
            `🟢 System Status: Active\n` +
            `━━━━━━━━━━━━━━━━━━`;
        }

        return message.reply(listMsg);

      } catch (err) {
        console.error("Quiz list error:", err);
        return message.reply(
          "❌ Unable to fetch quiz database information."
        );
      }
    }

    // QUIZ CATEGORY
    const rawCategory = args[0];
    const requestedCategory = normalizeCategory(rawCategory);

    if (rawCategory && !requestedCategory) {
      return message.reply(
        `❌ Invalid category: "${rawCategory}"\n` +
        "✅ Valid categories: bn/bangla, en/english, math\n\n" +
        `Usage:\n${this.config.guide.replace(/{pn}/g, this.config.name)}`
      );
    }

    try {
      const url = requestedCategory
        ? `${BASE_URL}?category=${requestedCategory}`
        : BASE_URL;

      const res = await axios.get(url);
      const quiz = res.data;

      if (!quiz.status) {
        return message.reply("❌ API returned an invalid response.");
      }

      const categoryLabel =
        CATEGORY_LABELS[quiz.category] || quiz.category;

      const labels = ["A", "B", "C", "D"];

      const optionsText = quiz.options
        .map((opt, index) => `${labels[index]}. ${opt}`)
        .join("\n");

      const msgText =
        `🧠 𝗤𝗨𝗜𝗭 𝗖𝗛𝗔𝗟𝗟𝗘𝗡𝗚𝗘 (${categoryLabel})\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `❓ 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡:\n${quiz.question}\n\n` +
        `📝 𝗢𝗣𝗧𝗜𝗢𝗡𝗦:\n${optionsText}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⏳ You have 60 seconds to reply with the correct letter (A, B, C, or D).`;

      return message.reply(msgText, (err, info) => {
        if (err || !info) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          correctAnswer: quiz.answer,
          correctText: quiz.correct_text
        });

        setTimeout(() => {
          if (global.GoatBot.onReply.has(info.messageID)) {
            api.unsendMessage(info.messageID);
            global.GoatBot.onReply.delete(info.messageID);
          }
        }, 60000);
      });

    } catch (err) {
      console.error("Quiz error:", err);

      return message.reply(
        "❌ Unable to establish a connection with the quiz server."
      );
    }
  },

  onReply: async function ({ event, Reply, message, usersData, api }) {
    const { senderID, body } = event;

    if (senderID !== Reply.author) return;

    const userAnswer = body.trim().toUpperCase();
    const validOptions = ["A", "B", "C", "D"];

    if (!validOptions.includes(userAnswer)) return;

    try {
      api.unsendMessage(Reply.messageID);

      let resultMsg = "";

      if (userAnswer === Reply.correctAnswer) {
        const userData = await usersData.get(senderID);
        const currentMoney = parseInt(userData.money || 0);

        await usersData.set(senderID, {
          money: currentMoney + REWARD
        });

        resultMsg =
          `🎉 𝗖𝗢𝗥𝗥𝗘𝗖𝗧 𝗔𝗡𝗦𝗪𝗘𝗥!\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `✅ You chose [ ${userAnswer} ].\n` +
          `📖 Explanation:\n${Reply.correctText}\n` +
          `💰 Reward: +${REWARD.toLocaleString()} ৳`;
      } else {
        resultMsg =
          `😞 𝗪𝗥𝗢𝗡𝗚 𝗔𝗡𝗦𝗪𝗘𝗥!\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `❌ Your choice was [ ${userAnswer} ].\n` +
          `📖 The correct answer is:\n` +
          `[ ${Reply.correctAnswer} ] : ${Reply.correctText}`;
      }

      message.reply(resultMsg);
      global.GoatBot.onReply.delete(Reply.messageID);

    } catch (err) {
      console.error("Quiz answer error:", err);

      return message.reply(
        "❌ An unexpected error occurred while processing your answer."
      );
    }
  }
};