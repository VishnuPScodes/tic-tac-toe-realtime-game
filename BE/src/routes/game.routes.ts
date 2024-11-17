import { Router } from 'express';
import { GameController } from '../controllers/game.controller';

const router = Router();
const gameController = new GameController();

// Routes will be implemented later
router.post('/new', gameController.createGame);
router.post('/move', gameController.makeMove);
router.get('/state/:gameId', gameController.getGameState);

export default router;
