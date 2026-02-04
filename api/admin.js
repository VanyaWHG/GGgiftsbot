import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    admin_id,
    action,
    target,   // telegram_id пользователя
    amount,   // для +/-
    value,    // для set_balance
    query     // для поиска
  } = req.body;

  // 🔐 проверка админа
  const { data: admin, error: adminError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("telegram_id", admin_id)
    .single();

  if (adminError || !admin || !admin.is_admin) {
    return res.status(403).json({ error: "Not admin" });
  }

  // 🔍 ПОИСК ПОЛЬЗОВАТЕЛЯ
  if (action === "search_user") {
    const { data, error } = await supabase
      .from("users")
      .select("telegram_id, username, balance, is_banned")
      .or(`username.ilike.%${query}%,telegram_id.eq.${query}`);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ users: data });
  }

  // 👤 ОТКРЫТЬ ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
  if (action === "get_user") {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", target)
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    const { data: inventory } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", target);

    return res.json({
      user,
      inventory: inventory || []
    });
  }

  // ➕ ДОБАВИТЬ БАЛАНС
  if (action === "add_balance") {
    await supabase.rpc("add_balance", {
      user_id: target,
      value: amount
    });
  }

  // ➖ УБРАТЬ БАЛАНС
  if (action === "remove_balance") {
    await supabase.rpc("add_balance", {
      user_id: target,
      value: -amount
    });
  }

  // ✏️ УСТАНОВИТЬ БАЛАНС НАПРЯМУЮ
  if (action === "set_balance") {
    await supabase
      .from("users")
      .update({ balance: value })
      .eq("telegram_id", target);
  }

  // 🚫 БАН / РАЗБАН
  if (action === "toggle_ban") {
    const { data: user } = await supabase
      .from("users")
      .select("is_banned")
      .eq("telegram_id", target)
      .single();

    await supabase
      .from("users")
      .update({ is_banned: !user.is_banned })
      .eq("telegram_id", target);
  }

  // ❌ УДАЛИТЬ ПРЕДМЕТ ИЗ ИНВЕНТАРЯ
  if (action === "delete_item") {
    await supabase
      .from("inventory")
      .delete()
      .eq("id", value);
  }

  return res.json({ success: true });
}
