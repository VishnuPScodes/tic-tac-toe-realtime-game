import { Game } from '../models/Game';
import { GameMove } from '../types/game.types';

export class GameService {
    private games: Map<string, Game>;

    constructor() {
        this.games = new Map();
    }

    // Service methods will be implemented later
}
