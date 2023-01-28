import { Router } from 'express';
import * as botController from './../controllers/bot.controller.js';
import * as botConfigurationController from './../controllers/bot-configure.controller.js'; 

const router = Router();

router.get('/ping', (req, res) => res.send('pong'));
router.post('/process-msg', botController.processMsg);
router.post('/set-webhook', botConfigurationController.setWebhook);
router.post('/set-my-commands', botConfigurationController.setMyCommands);
router.get('/get-my-commands', botConfigurationController.getMyCommands);

export default router;