const express = require("express");

app = express();

const PORT = 3000 || process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
    res.send({
        status: 200,
        msg: `App running on ${PORT}`
    });
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`)
});