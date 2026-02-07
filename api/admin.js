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
  
  if (action === "search") {
  const clean = target.replace("@", "");

  const { data } = await supabase
    .from("users")
    .select("*")
    .or(`telegram_id.eq.${clean},username.ilike.%${clean}%`);

  return res.json(data || []);
}

if (action === "get_user") {

  const clean = String(target).replace("@", "");

  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", clean)
    .single();

  if (!user) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .ilike("username", clean)
      .limit(1);

    user = data?.[0];
  }

  if (!user) {
    return res.json({ user: null });
  }

  const { data: inventory } = await supabase
    .from("inventory")
    .select("*")
    .eq("telegram_id", user.telegram_id);

  return res.json({
    user,
    inventory
  });
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

  // Удаление предмета
if (action === "delete_item") {
  await supabase
    .from("inventory")
    .delete()
    .eq("id", target);

  return res.json({ success: true });
}

// 6️⃣ рассылка ВСЕМ (текст + фото)
if (action === "broadcast") {

  const { data: users } = await supabase
    .from("users")
    .select("telegram_id");

  for (const u of users) {

    if (req.body.photo) {
      await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: u.telegram_id,
            photo: req.body.photo,
            caption: text || ""
          }),
        }
      );
    } else {
      await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: u.telegram_id,
            text,
          }),
        }
      );
    }
  }

  return res.json({ ok: true });
}

