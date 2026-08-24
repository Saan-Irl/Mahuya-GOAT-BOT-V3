const axios = require('axios');

const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby"],
    version: "0.0.1",
    author: "api owner dipto but file modify by saan",
    countDown: 0,
    role: 0,
    description: "update simsim",
    category: "CHARTING",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NewMessage]"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const link = `${await baseApiUrl()}/baby`;
    const aryan = args.join(" ").toLowerCase();
    const uid = event.senderID;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        // Remove or rm
        if (args[0] === 'remove' || args[0] === 'rm') {
            const keyword = args[0];
            const rest = aryan.replace(`${keyword} `, "").trim();
            if (!rest || rest === keyword) {
                return api.sendMessage('❌ | Format: remove [message] OR rm [message] - [index]', event.threadID, event.messageID);
            }

            if (rest.includes('-')) {
                const [fi, f] = rest.split(/\s*-\s*/);
                const da = (await axios.get(`${link}?remove=${encodeURIComponent(fi.trim())}&index=${f.trim()}&senderID=${uid}`)).data.message;
                return api.sendMessage(da, event.threadID, event.messageID);
            } else {
                const dat = (await axios.get(`${link}?remove=${encodeURIComponent(rest)}&senderID=${uid}`)).data.message;
                return api.sendMessage(dat, event.threadID, event.messageID);
            }
        }

        // List
        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit)
                const teachers = await Promise.all(limited.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = await usersData.getName(number).catch(() => number) || "Not found";
                    return { name, value };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, event.threadID, event.messageID);
            }
        }

        // Msg
        if (args[0] === 'msg') {
            const fuk = aryan.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        // Edit
        if (args[0] === 'edit') {
            if (!aryan.includes('-')) {
                return api.sendMessage('❌ | Invalid format! Use: edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            }
            const parts = aryan.replace("edit ", "").split(/\s*-\s*/);
            const editKey = parts[0]?.trim();
            const newReply = parts[1]?.trim();
            if (!editKey || !newReply || newReply.length < 1) {
                return api.sendMessage('❌ | Invalid format! Use: edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            }
            const dA = (await axios.get(`${link}?edit=${encodeURIComponent(editKey)}&replace=${encodeURIComponent(newReply)}&senderID=${uid}`)).data.message;
            return api.sendMessage(`${dA}`, event.threadID, event.messageID);
        }

        // Teach normal
        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
            const tex = re.data.message;
            let teacherName = "Unknown";
            try {
                const userData = await usersData.get(uid);
                teacherName = userData?.name || await usersData.getName(uid) || "Unknown";
            } catch (e) {
                try { teacherName = await usersData.getName(uid) || "Unknown"; } catch { teacherName = "Unknown"; }
            }
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacherName}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        // Teach amar
        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        // Teach react
        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        // Check name
        if (aryan.includes('amar name ki') || aryan.includes('amr nam ki') || aryan.includes('amar nam ki') || aryan.includes('amr name ki') || aryan.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        // Default reply
        const d = (await axios.get(`${link}?text=${aryan}&senderID=${uid}`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("Check console for error", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event, Reply }) => {
    try {
        if (event.type == "message_reply") {
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({ api, event, message }) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";

        // Custom Siyam replies
        if (event.senderID == "61587427123882" &&
            (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") ||
             body.startsWith("jan") || body.startsWith("babu") || body.startsWith("janu"))) {

            const siyamReplies = [
                "ji ji vai siyam bolo bolo suntechi🤗",
                "ji siyam vaiya?😊",
                "Siyam vaiya bolo kivabe help korte pari🤗",
                "assalamualaikum siyam vaiya😊",
                "Kemon aso siyam vaiya? 😎",
                "siyam Vaiya ki masti korbo? 😁",
                "hea siyam vai Bolo vaiya ki kaj korte pari 🤔"
            ];

            const replyMsg = siyamReplies[Math.floor(Math.random() * siyamReplies.length)];

            return api.sendMessage(replyMsg, event.threadID, (error, info) => {
                if (!info?.messageID) return;
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "bby",
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    siyamReplies
                });
            }, event.messageID);
        }

        // Normal replies for everyone else
        if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") ||
            body.startsWith("jan") || body.startsWith("babu") || body.startsWith("janu")) {

            const arr = body.replace(/^\S+\s*/, "");
            const randomReplies = ["😎", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte pari tmr jonno"];

            if (!arr) {
                return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
                    if (!info) message.reply("info obj not found");
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: "bby",
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID);
            }

            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}`)).data.reply;
            return api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "bby",
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }

    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};
