import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token);

// Путь к картинке
const imagePath = path.join(process.cwd(), "gggifts.jpg");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const update = req.body;

    // Команда /start
    if (update.message && update.message.text === "/start") {
      const chatId = update.message.chat.id;

      await bot.sendPhoto(chatId, fs.createReadStream(imagePath), {
        caption:
          "🎁 *Открывай бесплатные и авторские кейсы с NFT-подарками!*\n" +
          "🚀 *Апгрейди свои подарки до более ценных.*\n\n" +
          "✅ *Испытай удачу с нами!*",
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
  [{ 
  text: "🚀 Испытать удачу 🚀",
  web_app: { url: "https://gggiftsbot.vercel.app" }
}],
  [{ text: "🔥 Телеграмм с раздачами 🔥", url: "https://t.me/GGgifts_official" }],
  [{ text: "ℹ️ О нас", callback_data: "about" }],
  [{ text: "🤝 Сотрудничество / Поддержка", url: "https://t.me/GGgifts_help" }]
]

        }
      });
    }

    // Обработка нажатий кнопок
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const data = update.callback_query.data;

      // Сначала подтверждаем Telegram, чтобы кнопка перестала крутиться
      await bot.answerCallbackQuery(update.callback_query.id);

      // Отправляем сообщение асинхронно, не блокируя сервер
      if (data === "luck") {
        bot.sendMessage(chatId, "🎲 Твоя удача будет реализована здесь!");
      } else if (data === "about") {
  // Сразу подтверждаем callback
  await bot.answerCallbackQuery(update.callback_query.id);

  // Отправляем сообщение асинхронно
  bot.sendMessage(chatId, `
<b>Это официальный бот сервиса GGgifts — интерактивного Telegram-приложения, где ты можешь открывать кейсы с Telegram-подарками.</b>

• Честная механика выпадения призов
• Моментальное получение предметов в Telegram

📢 Наш канал в Telegram — <a href="https://t.me/GGgifts_official">@GGgifts_official</a>
📩 Поддержка — <a href="https://t.me/GGgifts_help">@GGgifts_help</a>
🤝 Сотрудничество — <a href="https://t.me/GGgifts_help">@GGgifts_help</a>
  `, { parse_mode: "HTML", disable_web_page_preview: true });
}

    }

    res.status(200).send("OK");
  } else {
    res.status(200).send("Bot is running");
  }
}
