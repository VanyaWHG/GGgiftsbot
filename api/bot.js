// /start
if (update.message && update.message.text === "/start") {
  const chatId = update.message.chat.id;

  // 🔵 СИНЯЯ КНОПКА Open App — РАБОЧАЯ
  await bot.sendPhoto(chatId, fs.createReadStream(imagePath), {
    caption:
      "🎁 *Открывай бесплатные и авторские кейсы с Telegram-подарками!*\n" +
      "🚀 *Апгрейди свои подарки до более ценных.*\n\n" +
      "✅ *Испытай удачу с нами!*",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Испытать удачу 🚀",
            web_app: { url: "https://gggiftsbot.vercel.app" }
          }
        ],
        [
          {
            text: "🔥 Телеграмм с раздачами 🔥",
            url: "https://t.me/GGgifts_official"
          }
        ],
        [
          { text: "ℹ️ О нас", callback_data: "about" }
        ],
        [
          {
            text: "🤝 Сотрудничество / Поддержка",
            url: "https://t.me/GGgifts_help"
          }
        ]
      ]
    }
  });
}
