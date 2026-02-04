import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const { username } = req.query;

  const { data } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .single();

  res.json(data);
}
