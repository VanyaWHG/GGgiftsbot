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

  // ===== PRE CHECKOUT =====
if (update.pre_checkout_query) {
  await fetch(`${API}/answerPreCheckoutQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pre_checkout_query_id: update.pre_checkout_query.id,
      ok: true
    })
  });

  return res.status(200).send("OK");
}


// ===== SUCCESSFUL PAYMENT =====
if (update.message?.successful_payment) {
  const userId = update.message.from.id;

  const amount = parseInt(
    update.message.successful_payment.total_amount
  );

  await supabase.rpc("add_balance", {
    user_id: userId,
    value: amount
  });

  return res.status(200).send("OK");
}


// ===== CALLBACK =====
if (update.callback_query?.data === "about") {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: update.callback_query.message.chat.id,
      text:
"Это официальный бот сервиса GGgifts — интерактивного Telegram-приложения, " +
"где ты можешь открывать кейсы с Telegram-подарками.\n\n" +
"• Честная механика выпадения призов\n" +
"• Моментальное получение предметов в Telegram\n\n" +
"📢 Наш канал в Telegram — @GGgifts_official\n" +
"📩 Поддержка — @GGgiftsHelp\n" +
"🤝 Сотрудничество — @GGgiftsHelp"
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
