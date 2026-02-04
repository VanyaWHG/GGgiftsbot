import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BOT_TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { admin_id, text } = req.body;

  // проверка админа
  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("telegram_id", admin_id)
    .single();

  if (!admin || !admin.is_admin) {
    return res.status(403).json({ error: "Not admin" });
  }

  const { data: users } = await supabase
    .from("users")
    .select("telegram_id");

  for (const user of users) {
    await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user.telegram_id,
        text,
      }),
    });
  }

  res.json({ success: true });
}
