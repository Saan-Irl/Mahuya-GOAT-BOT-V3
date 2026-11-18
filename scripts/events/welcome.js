const { getTime } = global.utils;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

const FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

const THEMES = {
    welcome: { a: "#00f0ff", b: "#ff2bd6", c: "#7b61ff" },
    bot: { a: "#a855ff", b: "#00ffa3", c: "#ff3d81" }
};

function rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function setFont(ctx, size, weight = "bold") {
    ctx.font = `${weight} ${size}px ${FONT}`;
}

function fitText(ctx, text, maxWidth, size, weight = "bold", minSize = 16) {
    let s = size;
    setFont(ctx, s, weight);
    while (ctx.measureText(text).width > maxWidth && s > minSize) {
        s -= 1;
        setFont(ctx, s, weight);
    }
    if (ctx.measureText(text).width > maxWidth) {
        let t = text;
        while (t.length > 1 && ctx.measureText(t + "...").width > maxWidth) t = t.slice(0, -1);
        return t + "...";
    }
    return text;
}

function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function hexPath(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + r * Math.cos(ang);
        const py = y + r * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function shapePath(ctx, shape, x, y, r) {
    if (shape === "hex") return hexPath(ctx, x, y, r);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
}

function glowStroke(ctx, color, width, blur) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.stroke();
    ctx.restore();
}

function neonText(ctx, text, x, y, color, blur = 25, core = "#ffffff") {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.fillStyle = core;
    ctx.fillText(text, x, y);
    ctx.restore();
}

async function fetchImage(url) {
    if (!url) return null;
    try {
        const res = await axios.get(url, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 15000
        });
        return await loadImage(Buffer.from(res.data));
    } catch (e) {
        return null;
    }
}

function drawBackground(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#06060f");
    g.addColorStop(0.5, "#0c0a1f");
    g.addColorStop(1, "#04040a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const glow = (x, y, r, color) => {
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, rgba(color, 0.32));
        rg.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, w, h);
    };
    glow(0, 0, 750, t.a);
    glow(w, h, 850, t.b);
    glow(w, 0, 550, t.b);
    glow(0, h, 550, t.a);

    ctx.strokeStyle = rgba(t.a, 0.05);
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    for (let i = 0; i < 110; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 2 + 0.5;
        ctx.fillStyle = rgba(Math.random() > 0.5 ? t.a : t.b, Math.random() * 0.5 + 0.1);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFrame(ctx, w, h, t) {
    roundRectPath(ctx, 30, 30, w - 60, h - 60, 24);
    glowStroke(ctx, t.a, 4, 30);

    roundRectPath(ctx, 48, 48, w - 96, h - 96, 16);
    ctx.strokeStyle = rgba(t.b, 0.45);
    ctx.lineWidth = 2;
    ctx.stroke();

    const o = 66;
    const L = 80;
    const corners = [[o, o, 1, 1], [w - o, o, -1, 1], [o, h - o, 1, -1], [w - o, h - o, -1, -1]];
    for (const [cx, cy, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * L);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * L, cy);
        glowStroke(ctx, t.b, 5, 25);
    }
}

function drawDivider(ctx, x1, x2, y, t) {
    const g = ctx.createLinearGradient(x1, 0, x2, 0);
    g.addColorStop(0, rgba(t.a, 0));
    g.addColorStop(0.25, t.a);
    g.addColorStop(0.75, t.b);
    g.addColorStop(1, rgba(t.b, 0));
    ctx.save();
    ctx.strokeStyle = g;
    ctx.lineWidth = 3;
    ctx.shadowColor = t.a;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    const cx = (x1 + x2) / 2;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = t.b;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(cx, y - 9);
    ctx.lineTo(cx + 9, y);
    ctx.lineTo(cx, y + 9);
    ctx.lineTo(cx - 9, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawAvatar(ctx, img, x, y, r, shape, colorA, colorB) {
    ctx.save();
    shapePath(ctx, shape, x, y, r + 28);
    glowStroke(ctx, colorB, 3, 25);
    shapePath(ctx, shape, x, y, r + 13);
    glowStroke(ctx, colorA, 6, 35);
    ctx.restore();

    ctx.save();
    shapePath(ctx, shape, x, y, r);
    ctx.clip();
    if (img) {
        const s = Math.max((2 * r) / img.width, (2 * r) / img.height);
        const iw = img.width * s;
        const ih = img.height * s;
        ctx.drawImage(img, x - iw / 2, y - ih / 2, iw, ih);
    } else {
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, rgba(colorA, 0.6));
        rg.addColorStop(1, "#0a0a18");
        ctx.fillStyle = rg;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();

    shapePath(ctx, shape, x, y, r);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();
}

function drawMiniAvatar(ctx, img, x, y, r, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
        const s = Math.max((2 * r) / img.width, (2 * r) / img.height);
        const iw = img.width * s;
        const ih = img.height * s;
        ctx.drawImage(img, x - iw / 2, y - ih / 2, iw, ih);
    } else {
        ctx.fillStyle = rgba(color, 0.4);
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    glowStroke(ctx, color, 3, 14);
}

function drawInfoBox(ctx, x, y, w, h, label, value, color, avatar) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 14);
    ctx.fillStyle = "rgba(12,12,28,0.85)";
    ctx.fill();
    glowStroke(ctx, color, 2.5, 14);

    roundRectPath(ctx, x + 14, y + 18, 6, h - 36, 3);
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    setFont(ctx, 18);
    ctx.fillStyle = rgba("#ffffff", 0.55);
    ctx.fillText(label, x + 38, y + 32);

    let maxW = w - 38 - 24;
    if (avatar) maxW -= 80;
    const text = fitText(ctx, value, maxW, h >= 100 ? 34 : 30);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x + 38, y + h - 20);

    if (avatar) drawMiniAvatar(ctx, avatar.img, x + w - 58, y + h / 2, 30, color);
}

function drawBanner(ctx, cx, cy, text, color, maxW) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fitted = fitText(ctx, text, maxW - 90, 32);
    const tw = ctx.measureText(fitted).width;
    const w = tw + 90;
    const h = 58;
    ctx.save();
    roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
    ctx.fillStyle = "rgba(10,10,26,0.9)";
    ctx.fill();
    glowStroke(ctx, color, 3, 20);
    ctx.restore();
    neonText(ctx, fitted, cx, cy + 2, color, 15);
}

async function createWelcomeCard(d) {
    const W = 1600;
    const H = 900;
    const t = THEMES.welcome;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx, W, H, t);
    drawFrame(ctx, W, H, t);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(ctx, 100);
    neonText(ctx, "WELCOME", W / 2, 120, t.a, 45);
    const sub = fitText(ctx, "TO  " + d.groupName.toUpperCase(), 1100, 42);
    neonText(ctx, sub, W / 2, 190, t.b, 28);
    drawDivider(ctx, 160, W - 160, 236, t);

    drawAvatar(ctx, d.groupImg, 290, 425, 125, "hex", t.a, t.b);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const gName = fitText(ctx, d.groupName, 420, 36);
    neonText(ctx, gName, 290, 625, t.a, 18);
    setFont(ctx, 20, "normal");
    ctx.fillStyle = rgba("#ffffff", 0.5);
    ctx.fillText("GROUP", 290, 667);

    drawAvatar(ctx, d.userImg, 1310, 425, 150, "circle", t.b, t.a);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const uName = fitText(ctx, d.userName, 460, 46);
    neonText(ctx, uName, 1310, 650, t.b, 20);
    drawBanner(ctx, 1310, 725, `${ordinal(d.memberCount)} MEMBER`, t.a, 460);

    drawInfoBox(ctx, 520, 285, 560, 100, "TOTAL MEMBERS", String(d.memberCount), t.a);
    drawInfoBox(ctx, 520, 400, 560, 100, "ADDED BY", d.adderName, t.b, { img: d.adderImg });
    drawInfoBox(ctx, 520, 515, 560, 100, "JOINED ON", `${d.dateStr}  |  ${d.timeStr}`, t.c);

    drawDivider(ctx, 160, W - 160, 788, t);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(ctx, 22, "normal");
    ctx.fillStyle = rgba("#ffffff", 0.55);
    ctx.fillText("Created By Saan", W / 2, 828);

    return canvas.toBuffer("image/png");
}

async function createBotCard(d) {
    const W = 1600;
    const H = 900;
    const t = THEMES.bot;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx, W, H, t);
    drawFrame(ctx, W, H, t);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(ctx, 80);
    neonText(ctx, "THANKS FOR INVITING ME", W / 2, 115, t.a, 40);
    const sub = fitText(ctx, `I AM ${d.botName.toUpperCase()}`, 900, 40);
    neonText(ctx, sub, W / 2, 185, t.b, 26);
    drawDivider(ctx, 160, W - 160, 230, t);

    drawAvatar(ctx, d.groupImg, 280, 395, 110, "hex", t.a, t.b);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const gName = fitText(ctx, d.groupName, 400, 34);
    neonText(ctx, gName, 280, 575, t.a, 16);
    setFont(ctx, 20, "normal");
    ctx.fillStyle = rgba("#ffffff", 0.5);
    ctx.fillText("GROUP", 280, 612);

    drawAvatar(ctx, d.botImg, 800, 395, 140, "circle", t.b, t.a);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const bName = fitText(ctx, d.botName, 440, 44);
    neonText(ctx, bName, 800, 590, t.b, 20);
    setFont(ctx, 20, "normal");
    ctx.fillStyle = rgba("#ffffff", 0.5);
    ctx.fillText("BOT", 800, 627);

    drawAvatar(ctx, d.adderImg, 1320, 395, 110, "hex", t.a, t.b);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const aName = fitText(ctx, d.adderName, 400, 34);
    neonText(ctx, aName, 1320, 575, t.a, 16);
    setFont(ctx, 20, "normal");
    ctx.fillStyle = rgba("#ffffff", 0.5);
    ctx.fillText("ADDED BY", 1320, 612);

    const bw = 322;
    const gap = 30;
    const bx = 110;
    const by = 655;
    drawInfoBox(ctx, bx, by, bw, 90, "TOTAL MEMBERS", String(d.memberCount), t.a);
    drawInfoBox(ctx, bx + (bw + gap), by, bw, 90, "ADMINS", String(d.adminCount), t.b);
    drawInfoBox(ctx, bx + (bw + gap) * 2, by, bw, 90, "PREFIX", `[ ${d.prefix} ]`, t.c);
    drawInfoBox(ctx, bx + (bw + gap) * 3, by, bw, 90, "ADDED ON", d.dateStr, t.a);

    drawBanner(ctx, W / 2, 790, `TYPE  [ ${d.prefix}help ]  TO SEE MY MENU`, t.b, 1000);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(ctx, 18, "normal");
    ctx.fillStyle = rgba("#ffffff", 0.5);
    ctx.fillText("Created By Saan", W / 2, 836);

    return canvas.toBuffer("image/png");
}

async function getGroupInfo(api, threadID, threadData) {
    let info = null;
    try {
        info = await api.getThreadInfo(threadID);
    } catch (e) { }

    const fallbackCount = () => {
        const m = threadData && threadData.members;
        if (!m) return 1;
        const arr = Array.isArray(m) ? m : Object.values(m);
        return arr.filter((x) => x && x.inGroup !== false).length || 1;
    };

    return {
        name: (info && (info.threadName || info.name)) || (threadData && threadData.threadName) || "this group",
        memberCount: (info && info.participantIDs && info.participantIDs.length) || fallbackCount(),
        adminCount: (info && info.adminIDs && info.adminIDs.length) || (threadData && threadData.adminIDs && threadData.adminIDs.length) || 0,
        image: (info && info.imageSrc) || (threadData && threadData.imageSrc) || `https://graph.facebook.com/${threadID}/picture?width=720&height=720`
    };
}

async function sendCard(message, buffer, body, mentions) {
    const dir = path.join(__dirname, "..", "cache");
    await fs.ensureDir(dir);
    const filePath = path.join(dir, `welcome_${Date.now()}.png`);
    await fs.writeFile(filePath, buffer);

    const payload = { attachment: fs.createReadStream(filePath) };
    if (body) payload.body = body;
    if (mentions) payload.mentions = mentions;
    await message.send(payload);

    setTimeout(() => fs.remove(filePath).catch(() => { }), 10000);
}

module.exports = {
    config: {
        name: "welcome",
        version: "6.0",
        author: "Inno Alt",
        category: "events"
    },

    langs: {
        en: {
            session1: "morning",
            session2: "noon",
            session3: "afternoon",
            session4: "evening",
            welcomeMessage: "╔═════════════════╗\n       📥 ɪɴᴠɪᴛᴀᴛɪᴏɴ ᴀᴄᴄᴇᴘᴛᴇᴅ\n╚═════════════════╝\n━━━━━━━━━━━━━━━━━━\n✨ ᴘʀᴇꜰɪx: [ %1 ]\n📖 ᴛʏᴘᴇ [ %1ʜᴇʟᴘ ] ᴛᴏ ꜱᴇᴇ ᴍʏ ᴍᴇɴᴜ\n\n『 ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇ! 』",
            multiple1: "ɴᴇᴡ ꜱᴏᴜʟ",
            multiple2: "ɴᴇᴡ ꜱᴏᴜʟꜱ",
            defaultWelcomeMessage: "『 ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ɴɪɢʜᴛᴍᴀʀᴇ 』\n━━━━━━━━━━━━━━━━━━\n👋 ʜᴇʟʟᴏ, {userNameTag}!\n🏘️ ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ: {boxName}\n🕒 ʜᴀᴠᴇ ᴀ ɢᴏᴏᴅ {session}\n\n[ 📝 ɴᴏᴛᴇ: ᴘʟᴇᴀꜱᴇ ʀᴇᴀᴅ ᴛʜᴇ ɢʀᴏᴜᴘ ʀᴜʟᴇꜱ ᴄᴀʀᴇꜰᴜʟʟʏ ]"
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
        if (event.logMessageType !== "log:subscribe") return;

        const hours = getTime("HH");
        const { threadID } = event;
        const { nickNameBot } = global.GoatBot.config;
        const prefix = global.utils.getPrefix(threadID);
        const dataAddedParticipants = event.logMessageData.addedParticipants;
        const botID = api.getCurrentUserID();

        if (dataAddedParticipants.some((item) => item.userFbId == botID)) {
            if (nickNameBot)
                api.changeNickname(nickNameBot, threadID, botID);

            try {
                const threadData = await threadsData.get(threadID);
                const group = await getGroupInfo(api, threadID, threadData);
                const adderID = event.author;

                const [botAvatar, adderAvatar, adderNameRaw, botNameRaw] = await Promise.all([
                    usersData.getAvatarUrl(botID),
                    usersData.getAvatarUrl(adderID),
                    usersData.getName(adderID),
                    usersData.getName(botID)
                ]);
                const [botImg, groupImg, adderImg] = await Promise.all([
                    fetchImage(botAvatar),
                    fetchImage(group.image),
                    fetchImage(adderAvatar)
                ]);

                const buffer = await createBotCard({
                    botImg,
                    groupImg,
                    adderImg,
                    botName: nickNameBot || botNameRaw || "BOT",
                    groupName: group.name,
                    adderName: adderNameRaw || "Unknown",
                    memberCount: group.memberCount,
                    adminCount: group.adminCount,
                    prefix,
                    dateStr: getTime("DD/MM/YYYY")
                });

                return await sendCard(message, buffer);
            } catch (error) {
                console.error("[WELCOME] Bot card error:", error);
                return message.send(getLang("welcomeMessage", prefix));
            }
        }

        if (!global.temp.welcomeEvent[threadID])
            global.temp.welcomeEvent[threadID] = {
                joinTimeout: null,
                dataAddedParticipants: []
            };

        global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
        clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

        global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
            const threadData = await threadsData.get(threadID);
            if (threadData.settings.sendWelcomeMessage == false)
                return;

            const addedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
            const dataBanned = threadData.data.banned_ban || [];
            const userName = [], mentions = [];
            let multiple = addedParticipants.length > 1;

            for (const user of addedParticipants) {
                if (dataBanned.some((item) => item.id == user.userFbId))
                    continue;
                userName.push(user.fullName);
                mentions.push({ tag: user.fullName, id: user.userFbId });
            }

            if (userName.length == 0) {
                delete global.temp.welcomeEvent[threadID];
                return;
            }

            const group = await getGroupInfo(api, threadID, threadData);
            const threadName = group.name;

            let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

            welcomeMessage = welcomeMessage
                .replace(/\{userNameTag\}|\{userName\}/g, userName.join(", "))
                .replace(/\{boxName\}|\{threadName\}/g, threadName)
                .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
                .replace(/\{session\}/g, hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4"));

            try {
                const firstUser = addedParticipants[0];
                const adderID = event.author;

                const [userAvatar, adderAvatar, adderNameRaw] = await Promise.all([
                    usersData.getAvatarUrl(firstUser.userFbId),
                    usersData.getAvatarUrl(adderID),
                    usersData.getName(adderID)
                ]);
                const [userImg, adderImg, groupImg] = await Promise.all([
                    fetchImage(userAvatar),
                    fetchImage(adderAvatar),
                    fetchImage(group.image)
                ]);

                const displayName = userName.length > 1
                    ? `${userName[0]} +${userName.length - 1}`
                    : userName[0];

                const buffer = await createWelcomeCard({
                    groupImg,
                    userImg,
                    adderImg,
                    userName: displayName,
                    memberCount: group.memberCount,
                    groupName: threadName,
                    adderName: adderNameRaw || "Unknown",
                    dateStr: getTime("DD/MM/YYYY"),
                    timeStr: getTime("hh:mm A")
                });

                await sendCard(message, buffer, welcomeMessage, mentions);
            } catch (error) {
                console.error("[WELCOME] Card creation error:", error);
                await message.send({
                    body: welcomeMessage,
                    mentions: mentions
                });
            }

            delete global.temp.welcomeEvent[threadID];
        }, 400);
    }
};

module.exports.createWelcomeCard = createWelcomeCard;
module.exports.createBotCard = createBotCard;
