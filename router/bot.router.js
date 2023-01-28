import { Router } from 'express';
import * as botController from './../controllers/bot.controller.js';

const router = Router();

router.get('/ping', (req, res) => res.send('pong'));
router.post('/process-msg', botController.processMsg);

export default router;