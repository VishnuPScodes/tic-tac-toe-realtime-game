"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_service_1 = require("../services/game.service");
class GameController {
    constructor() {
        this.createGame = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // Implementation will be added later
            res.status(501).json({ message: 'Not implemented yet' });
        });
        this.makeMove = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // Implementation will be added later
            res.status(501).json({ message: 'Not implemented yet' });
        });
        this.getGameState = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // Implementation will be added later
            res.status(501).json({ message: 'Not implemented yet' });
        });
        this.gameService = new game_service_1.GameService();
    }
}
exports.GameController = GameController;
