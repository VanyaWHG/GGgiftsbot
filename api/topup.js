import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { userId, amount } = req.body;

  await supabase.rpc("add_balance", {
    user_id: userId,
    value: amount
  });

  res.json({ success: true });
}
