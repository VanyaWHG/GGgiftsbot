export const config = {
  api: { bodyParser: true },
};

import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔴 ТВОЙ ID
const OWNER_ID = 7461986138;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  try {
    const update = req.body;

    // /start
    if (update.message?.text?.startsWith("/start")) {
      const user = update.message.from;
      const chatId = update.message.chat.id;

      // ⬇️ ДОБАВЛЯЕМ / ОБНОВЛЯЕМ ЮЗЕРА
      await supabase.from("users").upsert({
        telegram_id: user.id,
        username: user.username || null,
        balance: 0,
        is_admin: user.id === OWNER_ID // 👈 ВОТ ГЛАВНОЕ
      }, { onConflict: "telegram_id" });

      await fetch(`${API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: "https://gggiftsbot.vercel.app/gggifts.jpg",
          caption:
            "🎁 *Открывай кейсы с Telegram-подарками!*",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 Испытать удачу", web_app: { url: "https://gggiftsbot.vercel.app" } }],
              [{ text: "🤝 Поддержка", url: "https://t.me/GGgiftsHelp" }]
            ]
          }
        })
      });
    }

    // успешный платёж
    if (update.message?.successful_payment) {
      const payload = JSON.parse(update.message.successful_payment.invoice_payload);
      const userId = payload.user_id;
      const amount = payload.amount;

      await supabase
        .from("users")
        .update({ balance: supabase.raw(`balance + ${amount}`) })
        .eq("telegram_id", userId);
    }

    res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("ERROR");
  }
}
м
