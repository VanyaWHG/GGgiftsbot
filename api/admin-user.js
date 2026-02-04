import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { admin_id, user_id, action, value } = req.body;

  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("telegram_id", admin_id)
    .single();

  if (!admin?.is_admin) {
    return res.status(403).json({ error: "not admin" });
  }

  if (action === "set_balance") {
    await supabase
      .from("users")
      .update({ balance: value })
      .eq("telegram_id", user_id);
  }

  if (action === "toggle_ban") {
    const { data: user } = await supabase
      .from("users")
      .select("is_banned")
      .eq("telegram_id", user_id)
      .single();

    await supabase
      .from("users")
      .update({ is_banned: !user.is_banned })
      .eq("telegram_id", user_id);
  }

  if (action === "delete_item") {
    await supabase
      .from("inventory")
      .delete()
      .eq("id", value);
  }

  const user = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", user_id)
    .single();

  const inventory = await supabase
    .from("inventory")
    .select("*")
    .eq("user_id", user_id);

  res.json({ user: user.data, inventory: inventory.data });
}
