import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: true } };

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = req.body;

  try {

    // ====== /start ======
    if (update.message?.text?.startsWith("/start")) {
      const user = update.message.from;
      const chatId = update.message.chat.id;

      await supabase.from("users").upsert({
        telegram_id: user.id,
        username: user.username || null,
        balance: 0,
        is_admin: user.id === 7461986138,
        banned: false
      }, { onConflict: "telegram_id" });

      await fetch(`${API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: "https://gggiftsbot.vercel.app/gggifts.jpg",
          caption:
`🎁 *Открывай кейсы с Telegram-подарками*
🚀 *Апгрейдь призы до более ценных*

✅ Испытай удачу прямо сейчас!`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{
                text: "🚀 Испытать удачу",
                web_app: { url: "https://gggiftsbot.vercel.app" }
              }],
              [{
                text: "🔥 Telegram канал",
                url: "https://t.me/GGgifts_official"
              }],
              [{
                text: "ℹ️ О нас",
                callback_data: "about"
              }],
              [{
                text: "🤝 Поддержка / Сотрудничество",
                url: "https://t.me/GGgiftsHelp"
              }]
            ]
          }
        })
      });
    }

    // ====== CALLBACK ======
    if (update.callback_query?.data === "about") {
      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: update.callback_query.message.chat.id,
          text:
`GGgifts — интерактивное приложение с кейсами.

• Честная механика
• Моментальное получение
• Вывод подарков

@GGgifts_official`
        })
      });

      await fetch(`${API}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: update.callback_query.id
        })
      });
    }

    // ====== УСПЕШНЫЙ ПЛАТЁЖ ======
    if (update.message?.successful_payment) {
      const userId = update.message.from.id;
      const amount = parseInt(update.message.successful_payment.total_amount / 100);

      await supabase.rpc("add_balance", {
        user_id: userId,
        value: amount
      });
    }

    res.status(200).send("OK");

  } catch (err) {
    console.log(err);
    res.status(200).send("OK");
  }
}
