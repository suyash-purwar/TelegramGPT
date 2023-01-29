import { Router } from 'express';
import * as botController from './../controllers/bot.controller.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.get('/ping', (req, res) => res.send('pong'));
router.post('/process-msg', authenticate, botController.processMsg);

export default router;