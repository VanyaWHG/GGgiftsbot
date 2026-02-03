import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const userId = Number(req.query.id);

  const { data, error } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ balance: data.balance });
}
