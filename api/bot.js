import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

const imagePath = path.join(process.cwd(), "gggifts.jpg");

async function sendMessage(method, data) {
  await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("OK");
    }

    const update = req.body;

    /* /start */
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;

      const photo = fs.readFileSync(imagePath, { encoding: "base64" });

      await fetch(`${API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo,
          caption:
            "🎁 *Открывай бесплатные и авторские кейсы с Telegram-подарками!*\n" +
            "🚀 *Апгрейди свои подарки до более ценных.*\n\n" +
            "✅ *Испытай удачу с нами!*",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Испытать удачу 🚀",
                  web_app: {
                    url: "https://gggiftsbot.vercel.app",
                  },
                },
              ],
              [
                {
                  text: "🔥 Телеграмм с раздачами 🔥",
                  url: "https://t.me/GGgifts_official",
                },
              ],
              [
                {
                  text: "ℹ️ О нас",
                  callback_data: "about",
                },
              ],
              [
                {
                  text: "🤝 Сотрудничество / Поддержка",
                  url: "https://t.me/GGgifts_help",
                },
              ],
            ],
          },
        }),
      });
    }

    /* Callback */
    if (update.callback_query?.data === "about") {
      const chatId = update.callback_query.message.chat.id;

      await sendMessage("sendMessage", {
        chat_id: chatId,
        text:
          "Это официальный бот сервиса GGgifts — интерактивного Telegram-приложения.\n\n" +
          "📢 @GGgifts_official\n" +
          "📩 @GGgifts_help",
      });

      await sendMessage("answerCallbackQuery", {
        callback_query_id: update.callback_query.id,
      });
    }

    res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("ERR");
  }
}
