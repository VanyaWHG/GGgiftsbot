import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { admin_id, action, target, text } = req.body;

  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("telegram_id", admin_id)
    .single();

  if (!admin?.is_admin) {
    return res.status(403).json({ error: "Not admin" });
  }

  if (action === "search_user") {
    const { data } = await supabase
      .from("users")
      .select("*")
      .or(`telegram_id.eq.${target},username.ilike.%${target}%`);
    return res.json(data);
  }

  if (action === "broadcast") {
    const { data: users } = await supabase.from("users").select("telegram_id");
    for (const u of users) {
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: u.telegram_id, text })
      });
    }
    return res.json({ ok: true });
  }

  res.json({ ok: true });
}
