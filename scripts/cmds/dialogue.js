module.exports = {
  config: {
    name: "dialogue",
    version: "4.0",
    author: "𝗦𝗜𝗔𝗠 𝗔𝗛𝗠𝗘𝗗 𝗦𝗔𝗔𝗡",
    countDown: 3,
    role: 0,
    shortDescription: "Anime universe dialogues",
    longDescription: "Naruto, Akatsuki, Hokage, Jujutsu, Attack on Titan",
    category: "ANIME & MEDIA",
    guide: "{p}dialogue <name>"
  },

  onStart: async function ({ message, args }) {

    const input = args[0]?.toLowerCase();

    const data = {

      // 🔥 NARUTO
      naruto: [
        "I never go back on my word!",
        "I will become Hokage!",
        "Believe it!",
        "Hard work is my ninja way!",
        "I won’t give up!",
        "Friends are my power!",
        "Pain made me stronger!",
        "I fight for everyone!",
        "My ninja way never changes!",
        "I protect my village!",
        "Dattebayo!"
      ],

      sasuke: [
        "I walk the path of revenge.",
        "Power is everything.",
        "I reject bonds.",
        "I will destroy everything.",
        "My hate is my strength.",
        "I don’t need anyone.",
        "I follow my own path.",
        "I am darkness.",
        "Justice means nothing.",
        "I choose destruction."
      ],

      madara: [
        "Wake up to reality!",
        "Power decides everything.",
        "Weakness disgusts me.",
        "I am the ghost of Uchiha.",
        "The world is beyond saving.",
        "I alone define justice.",
        "Despair is truth.",
        "Bow before me.",
        "I am unstoppable.",
        "Nothing is real."
      ],

      obito: [
        "I am no one.",
        "This world is fake.",
        "Rin is my reason.",
        "Hope is illusion.",
        "Pain made me empty.",
        "I will create a new world.",
        "Everything is meaningless.",
        "Love creates hate.",
        "I lost everything.",
        "Reality is cruel."
      ],

      itachi: [
        "Forgive me, Sasuke.",
        "True power is sacrifice.",
        "I did it for the village.",
        "You are weak.",
        "A ninja must endure.",
        "Peace requires darkness.",
        "I always loved you.",
        "Truth is hidden.",
        "I chose my burden.",
        "I protect the village from shadows."
      ],

      // ⚡ AKATSUKI
      pain: [
        "Feel pain, understand pain.",
        "The world shall know pain.",
        "I am justice.",
        "Peace through suffering.",
        "Humanity must evolve.",
        "Pain is truth.",
        "All must suffer equally.",
        "I will change reality.",
        "Nothing is real except pain.",
        "God of this world."
      ],

      kisame: [
        "This world is full of lies.",
        "I enjoy battle.",
        "Strength is survival.",
        "Fear me.",
        "I am a monster.",
        "Blood is natural.",
        "No escape.",
        "Pain is entertainment.",
        "Sharks rule the sea.",
        "Death is peace."
      ],

      deidara: [
        "Art is an explosion!",
        "Boom is beauty.",
        "True art is momentary.",
        "Explosion is life.",
        "Clay is alive.",
        "Art must be seen.",
        "Beauty in destruction.",
        "I create perfection.",
        "Art is truth.",
        "KATSU!"
      ],

      // ⚡ JJK
      gojo: [
        "Throughout heaven and earth, I alone am the honored one.",
        "I am the strongest.",
        "Infinity is unstoppable.",
        "You can’t touch me.",
        "Domain Expansion!",
        "Don’t worry, I’m here.",
        "Speed means nothing.",
        "I see everything.",
        "Fun starts now.",
        "You are weak."
      ],

      sukuna: [
        "I am the King of Curses.",
        "Know your place.",
        "You are weak.",
        "This is true fear.",
        "I enjoy destruction.",
        "Bow before me.",
        "Pain is pleasure.",
        "I am above all.",
        "You cannot resist.",
        "Death is natural."
      ],

      // ⚡ ATTACK ON TITAN
      eren: [
        "I will destroy my enemies.",
        "Freedom is everything.",
        "I just keep moving forward.",
        "The world is cruel.",
        "I will change everything.",
        "No one can stop me.",
        "Fight until the end.",
        "I am the Attack Titan.",
        "Freedom or death.",
        "This world must end."
      ]
    };

    if (!input || !data[input]) {
      return message.reply(
`❌ Use:
/dialogue naruto
/dialogue sasuke
/dialogue madara
/dialogue obito
/dialogue itachi
/dialogue pain
/dialogue kisame
/dialogue deidara
/dialogue gojo
/dialogue sukuna
/dialogue eren`
      );
    }

    const list = data[input];

    if (!Array.isArray(list) || list.length === 0) {
      return message.reply("❌ No dialogue found.");
    }

    const random = list[Math.floor(Math.random() * list.length)];

    return message.reply(
      `🔥 ${input.toUpperCase()}:\n\n"${random}"`
    );
  }
};
