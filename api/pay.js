export default async function handler(req, res) {
  const { user_id, amount } = req.body;

  const invoice = {
    title: "Пополнение GGgifts",
    description: "Зачисление звёзд",
    payload: JSON.stringify({ user_id, amount }),
    provider_token: "",
    currency: "XTR",
    prices: [{ label: "Stars", amount: amount * 100 }]
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
  res.json({ link: data.result });
}
