import { Request, Response } from 'express';
import { GameService } from '../services/game.service';

export class GameController {
    private gameService: GameService;

    constructor() {
        this.gameService = new GameService();
    }

    createGame = async (req: Request, res: Response) => {
        // Implementation will be added later
        res.status(501).json({ message: 'Not implemented yet' });
    };

    makeMove = async (req: Request, res: Response) => {
        // Implementation will be added later
        res.status(501).json({ message: 'Not implemented yet' });
    };

    getGameState = async (req: Request, res: Response) => {
        // Implementation will be added later
        res.status(501).json({ message: 'Not implemented yet' });
    };
}
