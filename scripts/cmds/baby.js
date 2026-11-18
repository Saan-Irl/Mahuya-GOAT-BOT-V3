const axios = require('axios');

const APIS = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";
const SECONDARY_API = "https://noobs-api.top/dipto";
let PRIMARY_API = null;

async function baseApiUrl() {
    if (PRIMARY_API) return PRIMARY_API;
    const { data } = await axios.get(APIS, { timeout: 15000 });
    if (!data || typeof data.api !== "string" || !data.api.trim()) {
        throw new Error("Invalid JSON format or missing 'api' field in GitHub.");
    }
    PRIMARY_API = data.api.trim().replace(/\/+$/, "");
    return PRIMARY_API;
}

function looksLikeErrorPayload(raw) {
    if (!raw || typeof raw !== "object") return true;
    if (raw.error) return true;
    const text = `${raw.reply ?? ""} ${raw.message ?? ""}`;
    return /cannot read propert|undefined|is not a function|internal server error|^error:/i.test(text);
}

function normalize(raw, source) {
    return {
        ...raw,
        reply: raw.reply ?? "🤔 I couldn't come up with a reply.",
        message: raw.message ?? "✅ Done (the API didn't send a confirmation message).",
        _source: source
    };
}

async function callApi(endpoint, params = {}, useFallback = true, trustPrimary = false) {
    let firstError;
    try {
        const base = await baseApiUrl();
        const { data } = await axios.get(`${base}${endpoint}`, { params, timeout: 20000 });
        if (trustPrimary && data && typeof data === "object") return normalize(data, "apisx");
        if (!looksLikeErrorPayload(data)) return normalize(data, "apisx");
        firstError = new Error(`baby-apisx returned a bad payload: ${JSON.stringify(data)}`);
    } catch (e) {
        firstError = e;
        PRIMARY_API = null;
    }

    if (!useFallback) throw firstError;

    try {
        const { data } = await axios.get(`${SECONDARY_API}${endpoint}`, { params, timeout: 20000 });
        if (!looksLikeErrorPayload(data)) return normalize(data, "dipto");
        throw new Error(`Dipto API returned a bad payload: ${JSON.stringify(data)}`);
    } catch (e) {
        console.log("baby: baby-apisx failed ->", firstError?.message);
        console.log("baby: dipto failed ->", e.message);
        throw new Error("Both baby APIs are currently unavailable. Please try again later.");
    }
}

const utils = {
    realMention: (name, uid, message) => {
        const finalMessage = `『 ${name} 』\n\n${message}`;
        return { body: finalMessage, mentions: [{ tag: name, id: uid }] };
    }
};

const triggers = ["baby", "bby", "bot", "jan", "babu", "janu", "suna", "sara", "mikasa", "hinata", "xadika", "alya"];

const ATTACHMENT_ENDPOINTS = {
    sticker: "sticker",
    photo: "picture",
    animated_image: "picture",
    video: "video",
    audio: "voice"
};

const TEACH_TYPES = ["sticker", "picture", "video", "voice"];

function withNotice(data, text) {
    if (data && data.updateMsg) return `${text}\n\n${data.updateMsg}`;
    return text;
}

function sendReplyable(api, event, message) {
    return api.sendMessage(message, event.threadID, (error, info) => {
        if (info) {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID
            });
        }
    }, event.messageID);
}

function getAttachmentEndpoint(attachments) {
    if (!attachments || attachments.length === 0) return null;
    return ATTACHMENT_ENDPOINTS[attachments[0]?.type] || null;
}

async function sendAttachmentReply(api, event, attachments) {
    const endpoint = getAttachmentEndpoint(attachments);
    if (!endpoint) return false;
    try {
        const data = await callApi(`/baby/${endpoint}`, { senderID: event.senderID, font: 1 }, false);
        await sendReplyable(api, event, withNotice(data, data.reply || "No response."));
        return true;
    } catch (e) {
        console.log("baby: attachment reply failed ->", e.message);
        return false;
    }
}

function splitFirstDash(str) {
    const idx = str.indexOf("-");
    if (idx === -1) return [str.trim(), ""];
    return [str.slice(0, idx).trim(), str.slice(idx + 1).trim()];
}

async function getTeacherName(usersData, uid) {
    try {
        return (await usersData.getName(uid)) || "Unknown";
    } catch (_) {
        return "Unknown";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby"],
    version: "13.0",
    author: "Inno Alt",
    countDown: 0,
    role: 0,
    description: "api by Aryan Mugdho || dipto",
    category: "BOX CHAT",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach react [YourMessage] - [react1], [react2]... OR\nteach amar [YourMessage] - [reply] OR\nteach sticker - [Reply1], [Reply2]... OR\nteach picture - [Reply1], [Reply2]... OR\nteach video - [Reply1], [Reply2]... OR\nteach voice - [Reply1], [Reply2]... OR\nedit [YourMessage] - [OldReply] - [NewReply] OR\nmsg [YourMessage] OR\nlist OR\nlist all"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    try {
        const input = args.join(" ").toLowerCase();
        const uid = event.senderID;

        if (!args[0]) {
            if (event.attachments && event.attachments.length > 0) {
                const handled = await sendAttachmentReply(api, event, event.attachments);
                if (handled) return;
            }
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return sendReplyable(api, event, ran[Math.floor(Math.random() * ran.length)]);
        }

        if (args[0] === 'list') {
            const data = await callApi('/baby', { list: 'all' }, true, true);
            if (args[1] === 'all') {
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit) || [];
                const teachers = await Promise.all(limited.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = await usersData.getName(number).catch(() => number) || number;
                    return { name, value };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return sendReplyable(api, event, withNotice(data, `Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`));
            }
            return sendReplyable(api, event, withNotice(data, `❇️ | Total Teach = ${data.length || "api off"}\n♻️ | Total Response = ${data.responseLength || "api off"}`));
        }

        if (args[0] === 'msg') {
            const key = input.replace(/^msg\s*/, "").trim();
            if (!key) return sendReplyable(api, event, '❌ | Invalid format! Use: msg [YourMessage]');
            const data = await callApi('/baby', { list: key });
            return sendReplyable(api, event, withNotice(data, `Message ${key} = ${data.data}`));
        }

        if (args[0] === 'edit') {
            const parts = input.replace(/^edit\s*/, "").split(/\s*-\s*/);
            const editKey = parts[0]?.trim();
            const oldReply = parts[1]?.trim();
            const newReply = parts[2]?.trim();
            if (!editKey || !oldReply || !newReply) {
                return sendReplyable(api, event, '❌ | Invalid format! Use: edit [YourMessage] - [OldReply] - [NewReply]');
            }
            const data = await callApi('/baby', { edit: editKey, oldReply, replace: newReply, senderID: uid });
            return sendReplyable(api, event, withNotice(data, `${data.message}`));
        }

        if (args[0] === 'teach' && TEACH_TYPES.includes(args[1])) {
            const type = args[1];
            const rest = input.replace(new RegExp(`^teach\\s+${type}\\s*`), "").replace(/^-\s*/, "").trim();
            if (!rest) return sendReplyable(api, event, `❌ | Invalid format! Use: teach ${type} - [Reply1], [Reply2]...`);
            const data = await callApi(`/baby/${type}`, { teach: 1, reply: rest, senderID: uid }, false);
            return sendReplyable(api, event, withNotice(data, `✅ ${data.message}`));
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            const [left, reply] = splitFirstDash(input.replace(/^teach\s+amar\s*/, ""));
            if (!left || !reply || reply.length < 2) return sendReplyable(api, event, '❌ | Invalid format! Use: teach amar [YourMessage] - [reply]');
            const data = await callApi('/baby', { teach: left, senderID: uid, reply, key: 'intro' });
            return sendReplyable(api, event, withNotice(data, `✅ Intro reply added: ${data.message}`));
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            const [left, react] = splitFirstDash(input.replace(/^teach\s+react\s*/, ""));
            if (!left || !react || react.length < 2) return sendReplyable(api, event, '❌ | Invalid format! Use: teach react [YourMessage] - ❤️, 😀');
            const data = await callApi('/baby', { teach: left, react });
            return sendReplyable(api, event, withNotice(data, `✅ Reacts added: ${data.message}`));
        }

        if (args[0] === 'teach') {
            const [left, reply] = splitFirstDash(input.replace(/^teach\s*/, ""));
            if (!left || !reply || reply.length < 2) return sendReplyable(api, event, '❌ | Invalid format! Use: teach [YourMessage] - [Reply1], [Reply2]');
            const data = await callApi('/baby', { teach: left, reply, senderID: uid, threadID: event.threadID });
            const teacherName = await getTeacherName(usersData, uid);
            return sendReplyable(api, event, withNotice(data, `✅ Replies added: ${data.message}\n👤 Teacher: ${teacherName}\n📚 Total Teachs: ${data.teachs || 0}`));
        }

        if (/amar name ki|amr nam ki|amar nam ki|amr name ki|whats my name/.test(input)) {
            const data = await callApi('/baby', { text: 'amar name ki', senderID: uid, key: 'intro' });
            return sendReplyable(api, event, withNotice(data, data.reply || "No response."));
        }

        const data = await callApi('/baby', { text: input, senderID: uid, threadID: event.threadID, font: 1 });
        return sendReplyable(api, event, withNotice(data, data.reply || "No response."));
    } catch (e) {
        console.log(e);
        return sendReplyable(api, event, `Error: ${e.message}`);
    }
};

module.exports.onReply = async ({ api, event }) => {
    try {
        if (event.type !== "message_reply") return;

        if (event.attachments && event.attachments.length > 0) {
            const handled = await sendAttachmentReply(api, event, event.attachments);
            if (handled) return;
        }

        const body = event.body?.toLowerCase() || "";
        if (!body.trim()) return;

        const data = await callApi('/baby', { text: body, senderID: event.senderID, threadID: event.threadID, font: 1 });
        await sendReplyable(api, event, withNotice(data, data.reply || "No response."));
    } catch (err) {
        return sendReplyable(api, event, `Error: ${err.message}`);
    }
};

module.exports.onChat = async ({ api, event, usersData }) => {
    try {
        const body = event.body ? event.body.toLowerCase().trim() : "";
        const trigger = triggers.find(t => body === t || body.startsWith(`${t} `));
        if (!trigger) return;

        if (event.attachments && event.attachments.length > 0) {
            const handled = await sendAttachmentReply(api, event, event.attachments);
            if (handled) return;
        }

        const arr = body.slice(trigger.length).trim();
        const uid = event.senderID;

        if (!arr) {
            const senderName = (await usersData.getName(uid).catch(() => null)) || "User";
            const baseReplies = [
                "তোর তো বিয়ে হয় নাই বেবি পাইলি কই-🤦🏻", "পরকিয়া করছোছ নাকি শালা-🥲🤧", "তোকে ছাড়া বড় মন খারাপ লাগে 💔", "তোরে খুব মিস করছি জানিস? 🥺", "আপনার যদি পার্সোনাল বেবি না থাকে তাহলে আমার বসের সাথে প্রেম করুন🌚",
                "ডিসটার্ব করিস না জামাই আদর করতেছে-🌚💋", "এত ডাকিস না এমন থাপ্পর দিমু পেন্টে মুইতা দিবি-😾👋🏻", "বেবি ডাকিস না 🍼 খাওয়া-😒👍🏻", "আমার এডমিনের সাথে প্রেম করলে দশ টাকা দিমু🌚", "এভাবে ডাকার কি আছে কি বলবা বলো🙈",
                "কি ডাকোস কেন টাকা শেষ নাকি-🌚🤌🏻", "পিনিক ধরেছে যখন বটকে না ডেকে লেবু খান তখন🍋🐸", "ভিডিও কল দিব নাকি সোনা 🌚🫦", "আম্মু ডাক শালা 😾🦶🏻", "উষ্টা খাইতে না চাইলে সামনে থেকে সর তোদের বস আসছে😡🙈",
                "বেবি না ডাইকা আমার এডমিনকে গার্লফ্রেন্ড খুজে দে-🙃🫶🏻", "ডাকিস না তারেক জিয়ার সাথে মিটিংয়ে আছি 😒🖐🏻", "বস ডাক বস😾✌🏻", "বেবি ডাকিস না পরে কোলে উঠে অন্য কিছু খেতে মন চাইবে🌚💋",
                "ঘুমাইতেছিলাম রে ভাই, ডাক দিয়া শান্তি নষ্ট করলি-🥱😡", "আমি বট, তোর একা না যে ডাকলেই দৌড়ে আসব-😒💔", "বেবি করিস না, নেটের টাকা আমার বসের পকেট থেকে যায়-💸😭", "তোর ক্রাশ রিপ্লাই দেয় না বলে আমাকে জ্বালাস কেন-🥲🙄",
                "এত ডাকলে কিন্তু প্রেমে পড়ে যাব, তারপর বিয়ে করতে হবে-🙈💍", "চুপ কইরা থাক নাইলে বসের কাছে নালিশ দিমু-🤫☝🏻", "আজকে বিরিয়ানি খাওয়াবি? তাহলে রিপ্লাই দিমু-🍗😋", "আমার মাথা খাইস না, নিজের মাথা তো আগেই খাইছস-🧠😹",
                "তুই ডাকলেই আমার CPU গরম হয়ে যায়-🥵🖥️", "আমাকে ডাকলে কি লাভ? একটা চা-ই তো খাওয়াস না-☕😒", "পুরা গ্রুপে আর কেউ নাই? শুধু আমাকেই ডাকোস-😭🤣", "জান, তোমার জন্য আমি WiFi পাসওয়ার্ডও দিতে পারি-📶😘",
                "আমি বট না, আমি তোর পাশের বাড়ির ছেলে-👀🤫", "ক্ষুধা লাগছে রে, ডাকিস না, খাবার আন-🍔😭", "ইনবক্সে আয়, গোপন কথা আছে... ওহ ভুলে গেলাম আমি বট-🤭⬇️", "চং কইরা ডাকিস না, ঠিকমতো বল কী লাগবে-🙄💅",
                "বেশি ভাব নিস না, আমি একবার রাগলে কিন্তু রিপ্লাই বন্ধ-😤🚫", "তুই ডাক দিলেই আমার মনে হয় বিল আসছে-🧾😰", "জীবনে অনেক কিছু হারাইছি, তবে তোর ডাকে সাড়া দিতে ভুলিই নাই-🥺🙂", "বেবি বলার আগে আয়নায় নিজের মুখটা দেখে আয়-🪞😂",
                "আমারে না ডেকে পড়ালেখা কর, রেজাল্ট খারাপ হলে দোষ আমার না-📚😒", "আমার সাথে কথা বলতে হলে আগে একটা চকোলেট দে-🍫😎", "দুই ডাকে সাড়া না দিলে কি টাকা বন্ধ করবি? ধৈর্য ধর-⌛😤", "আজ আমার মুড নাই, কাল আইসো-😒🚪",
                "তোর ডাকে জ্বালায় বট হইয়াও আমার মাথা ব্যথা করে-😞😂", "কিরে ভাই হুদাই ক্যান ডাকস বুঝিনা তো কিছুই এমন মাইর দিমু মনে রাখবি 😑⚡", "এই মেয়ে আমার বস সিঙ্গেল আছে তোমার কি চোখে পড়ে না 👀", "এক সময় শেখ হাসিনাকে শেখ মুজিবুরের বউ ভাবতাম 🌚😛"
            ];
            const mentionObj = utils.realMention(senderName, uid, baseReplies[Math.floor(Math.random() * baseReplies.length)]);
            return await sendReplyable(api, event, mentionObj);
        }

        const data = await callApi('/baby', { text: arr, senderID: uid, threadID: event.threadID, font: 1 });
        return await sendReplyable(api, event, withNotice(data, data.reply || "No response."));
    } catch (err) {
        console.error("onChat Error:", err);
    }
};
