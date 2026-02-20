export default async function handler(req, res) {

  const { amount, telegram_id } = req.body;

  if (!amount || !telegram_id) {
    return res.status(400).json({ error: "Missing data" });
  }

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/createInvoiceLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Пополнение баланса GGgifts",
        description: "Зачисление Telegram Stars",
        payload: `stars_${telegram_id}_${Date.now()}`,
        currency: "XTR",
        prices: [
          { label: "Stars", amount: Number(amount) }
        ]
      })
    }
  );

  const data = await response.json();

  if (!data.ok) {
    return res.status(500).json({ error: data });
  }

  return res.json({ invoice: data.result });
}
