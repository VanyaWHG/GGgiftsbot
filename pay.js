export default async function handler(req, res) {
  const { user_id, amount } = req.body;

  const invoice = {
    title: "Пополнение баланса GGgifts",
    description: "Зачисление звёзд",
    payload: "stars",
    provider_token: "", // ПУСТО, ДЛЯ STARS
    currency: "XTR",
    prices: [{ label: "Stars", amount: amount * 100 }],
  };

  const r = await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/createInvoiceLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice),
    }
  );

  const data = await r.json();
  res.json({ invoice: data.result });
}
