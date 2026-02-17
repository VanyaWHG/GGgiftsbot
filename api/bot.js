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
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const update = req.body;

  try {

    // ===== /start =====
    if (update.message?.text?.startsWith("/start")) {
      const user = update.message.from;
      const chatId = update.message.chat.id;

      await supabase
        .from("users")
        .upsert({
          telegram_id: user.id,
          username: user.username || null,
          is_admin: user.id === 7461986138,
          banned: false
        }, { onConflict: "telegram_id" });

      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Добро пожаловать 🚀"
        })
      });

      return res.status(200).send("OK");
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
      const amount = update.message.successful_payment.total_amount;

      await supabase.rpc("add_balance", {
        user_id: userId,
        value: amount
      });

      return res.status(200).send("OK");
    }

    return res.status(200).send("OK");

  } catch (err) {
    console.log("BOT ERROR:", err);
    return res.status(200).send("OK");
  }
}
