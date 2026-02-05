export const config = {
  api: {
    bodyParser: true,
  },
};

import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }
  try {
    const update = req.body;

    // /start
    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id;
// ⬇️ ДОБАВЛЯЕМ / ОБНОВЛЯЕМ ЮЗЕРА В БАЗЕ
await supabase
  .from("users")
  .upsert({
    telegram_id: update.message.from.id,
    username: update.message.from.username || null,
    balance: 0,
    is_admin: false
  }, {
    onConflict: "telegram_id"
  });

      await fetch(`${API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: "https://gggiftsbot.vercel.app/gggifts.jpg",
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
                  url: "https://t.me/GGgiftsHelp"
                }
              ]
            ]
          }
        })
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
  "Это официальный бот сервиса GGgifts — интерактивного Telegram-приложения, где ты можешь открывать кейсы с Telegram-подарками.\n\n" +
  "• Честная механика выпадения призов\n" +
  "• Моментальное получение предметов в Telegram\n\n" +
  "📢 Наш канал в Telegram — @GGgifts_official\n" +
  "📩 Поддержка — @GGgifts_help\n" +
  "🤝 Сотрудничество — @GGgifts_help"
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
// успешный платеж
if (update.message?.successful_payment) {
  const userId = update.message.from.id;
  const stars = JSON.parse(
    update.message.successful_payment.invoice_payload
  ).stars;

  const fee = Math.ceil(stars * 0.05);
  const userGet = stars - fee;

  // начисляем пользователю
  await fetch(`${process.env.VERCEL_URL}/api/topup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      amount: stars
    })
  });
}

    res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("ERROR");
  }
}
