import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function roll(items) {
  const rand = Math.random() * 100;
  let acc = 0;
  for (const item of items) {
    acc += item.chance;
    if (rand <= acc) return item;
  }
}

export default async function handler(req, res) {
  const { userId, caseId } = req.body;

  // получаем кейс
  const { data: gameCase } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  // получаем юзера
  const { data: user } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single();

  if (user.balance < gameCase.price) {
    return res.json({ error: "Недостаточно ⭐" });
  }

  // получаем предметы
  const { data: items } = await supabase
    .from("case_items")
    .select("*")
    .eq("case_id", caseId);

  const win = roll(items);

  // списываем и начисляем
  await supabase
    .from("users")
    .update({ balance: user.balance - gameCase.price + win.value })
    .eq("id", userId);

  res.json({
    win: win.name,
    value: win.value
  });
}
