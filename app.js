const express = require("express");
const bot = require("./controllers/bot");

const app = express();

const PORT = 3000 || process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
    res.send({
        status: 200,
        msg: `App running on ${PORT}`
    });
});

app.post('/receive', async (req, res) => {
    try {
        const chatId = req.body.message.chat.id;
        const { text } = req.body.message;

        const { data, type } = await bot.handleQuery(text);
        switch (type) {
            case 'image':
                console.log(data);
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
                // Send message for command does not exist
                console.log("Heda hai kya?");
                break;
            case "OPENAI_SERVICE_DOWN":
                console.log("openai wala error");
                break;
            case "TELEGRAM_SERVICE_DOWN":
                console.log("telegram wala error");
                break;
            case "DESCRIPTION_INSUFFICIENT":
                console.log("image description not sufficient");
                break;
            case "EXCEEDED_IMG_GEN_LIMIT":
                console.log("at max 10 images can be generated per query");
                break;
            default:
                console.log("internal server error");
                break;
        }
        res.send(e.message);
    }
});

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`)
});