import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token);

// путь к картинке
const imagePath = path.join(process.cwd(), "gggifts.jpg");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const update = req.body;

    // START
    if (update.message && update.message.text === "/start") {
      const chatId = update.message.chat.id;

      await bot.sendPhoto(
        chatId,
        fs.createReadStream(imagePath),
        {
          caption:
            "🎁 *Открывай бесплатные и авторские кейсы с NFT-подарками!*\n" +
            "🚀 *Апгрейди свои подарки до более ценных.*\n\n" +
            "✅ *Испытай удачу с нами!*",
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: [
              ["🚀 Испытать удачу 🚀"],
              ["🔥 Телеграмм с раздачами 🔥"],
              ["ℹ️ О нас"],
              ["🤝 Сотрудничество / Поддержка"]
            ],
            resize_keyboard: true
          }
        }
      );
    }

    // кнопка поддержка
    if (update.message?.text === "🤝 Сотрудничество / Поддержка") {
      await bot.sendMessage(
        update.message.chat.id,
        "✉️ Напишите нам: @GGgifts_help"
      );
    }

    res.status(200).send("OK");
  } else {
    res.status(200).send("Bot is running");
  }
}
