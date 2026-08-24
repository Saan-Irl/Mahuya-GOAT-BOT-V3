const triviaList = [
  { q: "What is the capital of France?", a: "paris" },
  { q: "What planet is known as the Red Planet?", a: "mars" },
  { q: "How many continents are there on Earth?", a: "7" },
  { q: "What is 12 x 8?", a: "96" },
  { q: "What is the largest mammal?", a: "blue whale" },
  { q: "What is the chemical symbol for water?", a: "h2o" },
  { q: "Which language is primarily spoken in Brazil?", a: "portuguese" },
  { q: "Who wrote 'Romeo and Juliet'?", a: "shakespeare" },
  { q: "What is the fastest land animal?", a: "cheetah" },
  { q: "What is the smallest prime number?", a: "2" },
  { q: "What gas do plants absorb from the atmosphere?", a: "carbon dioxide" },
  { q: "Which ocean is the largest?", a: "pacific" },
  { q: "Who painted the Mona Lisa?", a: "da vinci" },
  { q: "How many colors are there in a rainbow?", a: "7" },
  { q: "What is the square root of 144?", a: "12" },
  { q: "Which planet has rings around it?", a: "saturn" },
  { q: "Who discovered gravity?", a: "newton" },
  { q: "What is the hardest natural substance?", a: "diamond" },
  { q: "Which country is famous for sushi?", a: "japan" },
  { q: "How many sides does a hexagon have?", a: "6" },
  { q: "What is 15 + 27?", a: "42" },
  { q: "Which metal has the chemical symbol Fe?", a: "iron" },
  { q: "Who invented the telephone?", a: "bell" },
  { q: "What is the largest planet in the solar system?", a: "jupiter" },
  { q: "How many bones are in the human body?", a: "206" },
  { q: "Which element's symbol is O?", a: "oxygen" },
  { q: "Which continent is Egypt part of?", a: "africa" },
  { q: "What is the currency of the USA?", a: "dollar" },
  { q: "Who wrote 'Harry Potter'?", a: "jk rowling" },
  { q: "What is the boiling point of water in Celsius?", a: "100" },
  { q: "Which animal is known as the King of the Jungle?", a: "lion" },
  { q: "What is the freezing point of water in Celsius?", a: "0" },
  { q: "What is the capital of Italy?", a: "rome" },
  { q: "Which planet is closest to the Sun?", a: "mercury" },
  { q: "How many minutes are in an hour?", a: "60" },
  { q: "What is the chemical symbol for Gold?", a: "au" },
  { q: "Which country gifted the Statue of Liberty to the USA?", a: "france" },
  { q: "What is the tallest mountain in the world?", a: "everest" },
  { q: "How many strings does a standard guitar have?", a: "6" },
  { q: "Which organ pumps blood through the body?", a: "heart" },
  { q: "What is the largest desert in the world?", a: "sahara" },
  { q: "Which year did World War II end?", a: "1945" },
  { q: "What is the main ingredient in hummus?", a: "chickpeas" },
  { q: "Which bird is a symbol of peace?", a: "dove" },
  { q: "How many years are in a century?", a: "100" },
  { q: "What is the capital of Japan?", a: "tokyo" },
  { q: "Who is known as the Father of Computers?", a: "charles babbage" },
  { q: "What is the smallest continent?", a: "australia" },
  { q: "Which blood type is known as the universal donor?", a: "o negative" },
  { q: "How many players are on a soccer team?", a: "11" },
  { q: "What is the chemical symbol for Silver?", a: "ag" },
  { q: "Which planet is known as the Evening Star?", a: "venus" },
  { q: "Who was the first man to step on the moon?", a: "neil armstrong" },
  { q: "What is the capital of Canada?", a: "ottawa" },
  { q: "How many legs does a spider have?", a: "8" },
  { q: "What is the largest organ in the human body?", a: "skin" },
  { q: "Which gas do humans breathe out?", a: "carbon dioxide" },
  { q: "What is the longest river in the world?", a: "nile" },
  { q: "In which country were the first Olympic Games held?", a: "greece" },
  { q: "What is the capital of Germany?", a: "berlin" },
  { q: "Which fruit is known as the King of Fruits?", a: "mango" },
  { q: "Who painted the Sistine Chapel ceiling?", a: "michelangelo" },
  { q: "What is the capital of Australia?", a: "canberra" },
  { q: "How many teeth does an adult human have?", a: "32" },
  { q: "What is the most common gas in Earth's atmosphere?", a: "nitrogen" },
  { q: "Which animal is the largest land animal?", a: "elephant" },
  { q: "What is the capital of Russia?", a: "moscow" },
  { q: "Who wrote 'The Odyssey'?", a: "homer" },
  { q: "Which country is the largest by land area?", a: "russia" },
  { q: "How many rings are there on the Olympic flag?", a: "5" },
  { q: "What is the capital of Spain?", a: "madrid" },
  { q: "Which planet is known as the gas giant?", a: "jupiter" },
  { q: "What is the currency of the UK?", a: "pound" },
  { q: "How many states are there in the USA?", a: "50" },
  { q: "What is the chemical symbol for Sodium?", a: "na" },
  { q: "Which ocean is between America and Europe?", a: "atlantic" },
  { q: "What is the capital of India?", a: "new delhi" },
  { q: "Who is the author of 'The Great Gatsby'?", a: "f. scott fitzgerald" },
  { q: "Which organ is responsible for breathing?", a: "lungs" },
  { q: "What is the tallest building in the world?", a: "burj khalifa" },
  { q: "How many seconds are in a minute?", a: "60" },
  { q: "What is the capital of China?", a: "beijing" },
  { q: "Which planet is the coldest?", a: "neptune" },
  { q: "What is the main metal in stainless steel?", a: "iron" },
  { q: "How many zeros are in a million?", a: "6" },
  { q: "What is the capital of Brazil?", a: "brasilia" },
  { q: "Who discovered Penicillin?", a: "alexander fleming" },
  { q: "Which country is the smallest in the world?", a: "vatican city" },
  { q: "What is the capital of South Korea?", a: "seoul" },
  { q: "How many days are in a leap year?", a: "366" },
  { q: "Which vitamin do we get from sunlight?", a: "vitamin d" },
  { q: "What is the capital of Thailand?", a: "bangkok" },
  { q: "Who is known as the Iron Man in Marvel?", a: "tony stark" },
  { q: "What is the chemical symbol for Helium?", a: "he" },
  { q: "How many players are in a basketball team?", a: "5" },
  { q: "What is the capital of Egypt?", a: "cairo" },
  { q: "Which animal has the longest neck?", a: "giraffe" },
  { q: "What is the square root of 64?", a: "8" },
  { q: "Who founded Microsoft?", a: "bill gates" },
  { q: "What is the national animal of India?", a: "tiger" }
];
   

module.exports = {
  config: {
    name: "iqtest",
    aliases: ["iq"],
    version: "3.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    countDown: 5,
    role: 0,
    shortDescription: "Trivia & IQ challenge",
    longDescription: "Sends a trivia question. Answer within 10s or see the correct answer.",
    category: "fun"
  },

  onStart: async function({ api, event, message, global }) {
    const trivia = triviaList[Math.floor(Math.random() * triviaList.length)];

    const sent = await api.sendMessage(
      `🧠 Brain Challenge:\n\n${trivia.q}\n\nReply with your answer within 20 seconds!`,
      event.threadID,
      event.messageID
    );

    if (!global.BrainBot) global.BrainBot = new Map();

    global.BrainBot.set(sent.messageID, {
      answer: trivia.a.toLowerCase(),
      author: event.senderID,
      timeout: setTimeout(() => {
        api.sendMessage(`⏰ Time's up! The correct answer was: ${trivia.a}`, event.threadID);
        global.BrainBot.delete(sent.messageID);
      }, 20000) 
    });
  },

  onReply: async function({ api, event, Reply, global }) {
    if (!global.BrainBot) return;
    const data = global.BrainBot.get(Reply.messageID);
    if (!data) return;
    if (event.senderID !== data.author) return;

    const userAnswer = event.body.toLowerCase().trim();
    if (userAnswer === data.answer) {
      clearTimeout(data.timeout);
      api.sendMessage(`✅ Correct! Well done 🏆`, event.threadID, event.messageID);
      global.BrainBot.delete(Reply.messageID);
    } else {
      clearTimeout(data.timeout);
      api.sendMessage(`❌ Wrong! The correct answer was: ${data.answer}`, event.threadID, event.messageID);
      global.BrainBot.delete(Reply.messageID);
    }
  }
};
