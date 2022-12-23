const express = require("express");
const bot = require("./controllers/bot");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send({
        status: 200,
        msg: `App running on ${PORT}`
    });
});

app.post('/receive', async (req, res) => {
    const chatId = req.body.message.chat.id;
    const { text } = req.body.message;
    try {
        const { data, type } = await bot.handleQuery(text);
        switch (type) {
            case 'image':
                await bot.sendImageMessage(chatId, data);
                break;
            case 'text':
                await bot.sendTextualMessage(chatId, data);
                break;
            default:
                throw new Error("INTERNAL_SERVER_ERROR");
        }
        res.sendStatus(200);
    } catch (e) {
        switch (e.message) {
            case "COMMAND_DOES_NOT_EXIST":
                await bot.sendTextualMessage(chatId, "The command does not exist.");
                break;
            case "OPENAI_SERVICE_DOWN":
                await bot.sendTextualMessage(chatId, "OpenAI API services temporarily down.");
                break;
            case "TELEGRAM_SERVICE_DOWN":
                await bot.sendTextualMessage(chatId, "Telegram Bot API services temporarily down.");
                break;
            case "DESCRIPTION_INSUFFICIENT":
                await bot.sendTextualMessage(chatId, "Please elaborate the image you want to generate.");
                break;
            case "EXCEEDED_IMG_GEN_LIMIT":
                await bot.sendTextualMessage(chatId, "At max ten images can be generated per query.")
                break;
            default:
                await bot.sendTextualMessage(chatId, "We have experienced unknown internal error. Hephaestus will shortly be back in service.")
                break;
        }
        res.send(e.message);
    }
});

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`)
});