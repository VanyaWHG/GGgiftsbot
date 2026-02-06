import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  const { admin_id, action, target, amount, text } = req.body;

  // Проверка админа
  const { data: admin } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", admin_id)
    .single();

  if (!admin || !admin.is_admin) {
    return res.status(403).json({ error: "Not admin" });
  }

  // Поиск пользователя
  if (action === "search") {
    const { data } = await supabase
      .from("users")
      .select("*")
      .or(`telegram_id.eq.${target},username.ilike.%${target}%`);

    return res.json(data);
  }

  // Получить профиль
  if (action === "get") {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", target)
      .single();

    return res.json(data);
  }

  // Изменить баланс
  if (action === "set_balance") {
    await supabase
      .from("users")
      .update({ balance: amount })
      .eq("telegram_id", target);

    return res.json({ success: true });
  }

  // Бан / разбан
  if (action === "toggle_ban") {
    await supabase
      .from("users")
      .update({ banned: amount })
      .eq("telegram_id", target);

    return res.json({ success: true });
  }

  // Рассылка
  if (action === "broadcast") {
    const { data: users } = await supabase
      .from("users")
      .select("telegram_id");

    for (const u of users) {
      await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: u.telegram_id,
            text
          })
        }
      );
    }

    return res.json({ success: true });
  }

  res.json({ ok: true });
}
