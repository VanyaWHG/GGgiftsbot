const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const bot = new TelegramBot(process.env.BOT_TOKEN);
const imagePath = path.join(process.cwd(), "gggifts.jpg");

module.exports = async (req, res) => {
  try {
    const update = req.body;

    // /start
    if (update.message && update.message.text === "/start") {
      const chatId = update.message.chat.id;

      // 🔵 СИНЯЯ КНОПКА Open App (ПРАВИЛЬНО)
      await bot.setChatMenuButton({
        menu_button: {
          type: "web_app",
          text: "Open App",
          web_app: {
            url: "https://gggiftsbot.vercel.app"
          }
        }
      });

      // Стартовое сообщение (ВСЁ КАК БЫЛО)
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
              {
                text: "ℹ️ О нас",
                callback_data: "about"
              }
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

    // Callback "О нас"
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;

      if (update.callback_query.data === "about") {
        await bot.sendMessage(
          chatId,
          "Это официальный бот сервиса GGgifts — интерактивного Telegram-приложения, где ты можешь открывать кейсы с Telegram-подарками.\n\n" +
          "• Честная механика выпадения призов\n" +
          "• Моментальное получение предметов в Telegram\n\n" +
          "📢 Наш канал — @GGgifts_official\n" +
          "📩 Поддержка — @GGgifts_help\n" +
          "🤝 Сотрудничество — @GGgifts_help"
        );
      }

      await bot.answerCallbackQuery(update.callback_query.id);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("BOT ERROR:", err);
    res.status(500).send("ERROR");
  }
};
