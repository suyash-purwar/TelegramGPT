const { Router } = require('express');
const botController = require('./../controllers/bot.controller');
const botConfigurationController = require('./../controllers/bot-configure.controller');

const router = Router();

router.get('/ping', (req, res) => res.send('pong'));
router.post('/process-msg', botController.processMsg);
router.post('/set-webhook', botConfigurationController.setWebhook);
router.post('/set-my-commands', botConfigurationController.setMyCommands);
router.get('/get-my-commands', botConfigurationController.getMyCommands);

module.exports = router;
