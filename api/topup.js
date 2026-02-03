import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  const { userId, amount } = req.body;

  const cleanAmount = Math.floor(Number(amount));
  if (cleanAmount <= 0) {
    return res.status(400).json({ error: "Неверная сумма" });
  }

  const fee = Math.ceil(cleanAmount * 0.05);
  const userGet = cleanAmount - fee;

  // получаем баланс юзера
  const { data: user } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single();

  // обновляем юзера
  await supabase
    .from("users")
    .update({ balance: user.balance + userGet })
    .eq("id", userId);

  // обновляем баланс бота
  const { data: bot } = await supabase
    .from("bot_balance")
    .select("balance")
    .eq("id", 1)
    .single();

  await supabase
    .from("bot_balance")
    .update({ balance: bot.balance + fee })
    .eq("id", 1);

  res.json({
    success: true,
    added: userGet,
    fee
  });
}
