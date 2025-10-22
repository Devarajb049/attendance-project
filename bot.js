require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { fetchAttendanceFromPortal } = require('./server');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("Bot token missing! Set TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const userSessions = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = { step: 'awaiting_username' };
  bot.sendMessage(chatId, '👋 Welcome! Please send your Student ID (e.g., 25695A0514).');
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!userSessions[chatId]) {
    bot.sendMessage(chatId, "Type /start to begin fetching attendance.");
    return;
  }

  const session = userSessions[chatId];

  if (session.step === 'awaiting_username') {
    session.username = text;
    session.step = 'awaiting_password';
    bot.sendMessage(chatId, "✅ Username received. Now send your portal *password*.", { parse_mode: "Markdown" });
    return;
  }

  if (session.step === 'awaiting_password') {
    session.password = text;
    bot.sendMessage(chatId, "⏳ Fetching attendance, please wait...");

    const username = session.username;
    const password = session.password;
    delete userSessions[chatId];

    try {
      const result = await fetchAttendanceFromPortal(username, password);

      if (!result || !result.subjects) {
        bot.sendMessage(chatId, "⚠️ No attendance found. Check credentials or portal status.");
        return;
      }

      const lines = result.subjects.map(s => `• ${s.subject}: ${s.percent}%`);
      const message = `🎯 *Attendance Summary*\n\n${lines.join("\n")}\n\n📊 *Overall:* ${result.overall}%`;

      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "❌ Failed to fetch. Try again later.");
    }
  }
});
