import { Telegraf, Markup } from "telegraf";
import fs from "fs";
import path from "path";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Путь к картинке
const imagePath = path.join(process.cwd(), "gggifts.jpg");

bot.start(async (ctx) => {
  const text = `
🎁 Открывай бесплатные и авторские кейсы с NFT-подарками!

🚀 Апгрейди свои подарки до более ценных.

✅ Испытай удачу с нами!
  `;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🚀 Испытать удачу 🚀", "luck")],
    [Markup.button.url("🔥 Телеграмм с раздачами 🔥", "https://t.me/your_channel")],
    [Markup.button.callback("ℹ️ О Нас", "about")],
    [Markup.button.url("💬 Поддержка", "https://t.me/GGgifts_help")]
  ]);

  await ctx.replyWithPhoto(
    { source: fs.createReadStream(imagePath) },
    {
      caption: text,
      ...keyboard
    }
  );
});

// Обработка кнопок
bot.action("luck", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply("🎲 Скоро тут будет система кейсов!");
});

bot.action("about", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply("ℹ️ Мы — GGgifts. Работаем над NFT-подарками 🚀");
});

// Webhook handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  await bot.handleUpdate(req.body);
  res.status(200).send("OK");
}
