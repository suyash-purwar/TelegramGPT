const express = require("express");
const bot = require("./controllers/bot");

app = express();

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
        console.log(req.body);
        const text = req.body.message.text;
        const chatId = req.body.message.chat.id;
        const response = bot.fetchResponse(text);
        // Feed the response to telegram /sendMessage endpoint
        const status = await bot.sendMessage(chatId, response.response);
        console.log(status);
        res.sendStatus(200);
    } catch (e) {
        res.send(e);
    }
});

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`)
});