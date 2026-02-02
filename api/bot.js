import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

export default async function handler(req, res) {
  try {
    const update = req.body;

    // /start
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;

      const imagePath = path.join(process.cwd(), "gggifts.jpg");

      const form = new FormData();
      form.append("chat_id", chatId);
      form.append(
        "caption",
        "🎁 *Открывай бесплатные и авторские кейсы с Telegram-подарками!*\n" +
          "🚀 *Апгрейди свои подарки до более ценных.*\n\n" +
          "✅ *Испытай удачу с нами!*"
      );
      form.append("parse_mode", "Markdown");
      form.append("photo", fs.createReadStream(imagePath));

      form.append(
        "reply_markup",
        JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "🚀 Испытать удачу 🚀",
                web_app: {
                  url: "https://gggiftsbot.vercel.app"
                }
              }
            ],
            [
              {
                text: "🔥 Телеграмм с раздачами 🔥",
                url: "https://t.me/GGgifts_official"
              }
            ],
            [
              {
                text: "ℹ️ О нас",
                callback_data: "about"
              }
            ],
            [
              {
                text: "🤝 Сотрудничество / Поддержка",
                url: "https://t.me/GGgifts_help"
              }
            ]
          ]
        })
      );

      await fetch(`${API}/sendPhoto`, {
        method: "POST",
        body: form
      });
    }

    // Callback
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;

      if (update.callback_query.data === "about") {
        await fetch(`${API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text:
              "Это официальный бот GGgifts.\n\n" +
              "📢 Канал — @GGgifts_official\n" +
              "📩 Поддержка — @GGgifts_help"
          })
        });
      }

      await fetch(`${API}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: update.callback_query.id
        })
      });
    }

    res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("ERROR");
  }
}
