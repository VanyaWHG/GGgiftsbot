import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { telegram_id } = req.body;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegram_id)
    .single();

  res.json(data);
}
