import fetch from "node-fetch";

const API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

export default async function handler(req, res) {
  const { amount } = req.body;
  const stars = Math.floor(Number(amount));

  if (stars <= 0) {
    return res.status(400).json({ error: "Неверная сумма" });
  }

  const payload = JSON.stringify({
    stars
  });

  const response = await fetch(`${API}/createInvoiceLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Пополнение баланса GGgifts",
      description: `Пополнение на ${stars} ⭐`,
      payload,
      currency: "XTR",
      prices: [
        { label: "Звёзды", amount: stars }
      ]
    })
  });

  const data = await response.json();
  res.json({ invoice_link: data.result });
}
