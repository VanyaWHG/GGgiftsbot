import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    const { id, username } = req.query;

    if (!id) {
      return res.status(400).json({ error: "No user id" });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (!user) {
      await supabase.from("users").insert({
        id,
        username,
        balance: 0,
        is_admin: false,
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
}
