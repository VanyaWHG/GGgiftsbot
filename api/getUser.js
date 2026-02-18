import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { telegram_id } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ error: "No telegram_id" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", Number(telegram_id)) // ВАЖНО
    .single();

  if (error) {
    console.log("GET USER ERROR:", error);
    return res.json(null);
  }

  res.json(data);
}
