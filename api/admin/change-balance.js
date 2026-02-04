import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const { userId, amount } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single();

  await supabase
    .from("users")
    .update({ balance: user.balance + Number(amount) })
    .eq("id", userId);

  res.json({ ok: true });
}
