import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { admin_id, query } = req.body;

  const { data: admin } = await supabase
    .from("users")
    .select("is_admin")
    .eq("telegram_id", admin_id)
    .single();

  if (!admin?.is_admin) {
    return res.status(403).json({ error: "not admin" });
  }

  const { data: users } = await supabase
    .from("users")
    .select("telegram_id, username, balance")
    .or(`username.ilike.%${query}%,telegram_id.eq.${query}`);

  res.json(users);
}
