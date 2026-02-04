import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { admin_id, action, target, amount, text } = req.body;

  // 1️⃣ проверка админа
  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("telegram_id", admin_id)
    .single();

  if (!admin || !admin.is_admin) {
    return res.status(403).json({ error: "Not admin" });
  }

  // 2️⃣ действия
  if (action === "add_balance") {
    await supabase.rpc("add_balance", {
      user_id: target,
      value: amount,
    });
  }

  if (action === "remove_balance") {
    await supabase.rpc("add_balance", {
      user_id: target,
      value: -amount,
    });
  }

  res.json({ success: true });
}
if (action === "search_user") {
  // поиск пользователя
}

if (action === "get_user") {
  // открыть профиль пользователя
}

if (action === "set_balance") {
  // изменить баланс
}

if (action === "toggle_ban") {
  // бан / разбан
}

if (action === "delete_item") {
  // удалить предмет
}
