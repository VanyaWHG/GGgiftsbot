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

const OWNER_ID = 7461986138;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  try {
    const update = req.body;

    // /start
    if (update.message?.text?.startsWith("/start")) {
      const user = update.message.from;
      const chatId = update.message.chat.id;

      // ⬇️ создаём / обновляем юзера
      await supabase.from("users").upsert({
        telegram_id: user.id,
        username: user.username || null,
        balance: 0,
        is_admin: user.id === OWNER_ID
      }, { onConflict: "telegram_id" });

      await fetch(`${API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: "https://gggiftsbot.vercel.app/gggifts.jpg",
          caption:
            "🎁 *GGgifts — кейсы с Telegram-подарками*\n\n" +
            "🚀 Открывай бесплатные и авторские кейсы\n" +
            "🎯 Апгрейдь подарки до более ценных\n\n" +
            "📢 Канал с раздачами — @GGgifts_official\n" +
            "🤝 Поддержка — @GGgiftsHelp",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Испытать удачу",
                  web_app: { url: "https://gggiftsbot.vercel.app" }
                }
              ],
              [
                { text: "🔥 Канал с раздачами", url: "https://t.me/GGgifts_official" }
              ],
              [
                { text: "ℹ️ О нас", callback_data: "about" }
              ],
              [
                { text: "🤝 Поддержка", url: "https://t.me/GGgiftsHelp" }
              ]
            ]
          }
        })
      });
    }

    // О нас
    if (update.callback_query?.data === "about") {
      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: update.callback_query.message.chat.id,
          text:
            "GGgifts — Telegram-приложение с честной механикой кейсов.\n\n" +
            "• Моментальные награды\n" +
            "• Честные шансы\n\n" +
            "📢 @GGgifts_official\n" +
            "🤝 @GGgiftsHelp"
        })
      });
    }

    res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("ERROR");
  }
}
