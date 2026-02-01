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

    // Обработка команды /start
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
            [{ text: "🚀 Испытать удачу 🚀", callback_data: "luck" }],
            [{ text: "🔥 Телеграмм с раздачами 🔥", callback_data: "tg" }],
            [{ text: "ℹ️ О нас", callback_data: "about" }],
            [{ text: "🤝 Сотрудничество / Поддержка", url: "https://t.me/GGgifts_help" }]
          ]
        }
      });
    }

    // Обработка нажатий кнопок (callback_data)
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const data = update.callback_query.data;

      if (data === "luck") {
        await bot.sendMessage(chatId, "🎲 Твоя удача будет реализована здесь!");
      } else if (data === "tg") {
        await bot.sendMessage(chatId, "🔥 Присоединяйся к нашим раздачам!");
      } else if (data === "about") {
        await bot.sendMessage(chatId, "Это официальный бот сервиса GGgifts — интерактивного Telegram-приложения, где ты можешь открывать кейсы с Telegram-подарками.

• Честная механика выпадения призов
• Моментальное получение предметов в Telegram

📢 Наш канал в Telegram — @GGgifts_official
📩 Поддержка — @GGgifts_help
🤝 Сотрудничество — @GGgifts_help");
      }

      // Подтверждаем Telegram, что callback обработан
      await bot.answerCallbackQuery(update.callback_query.id);
    }

    res.status(200).send("OK");
  } else {
    res.status(200).send("Bot is running");
  }
}
