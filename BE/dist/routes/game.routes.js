"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
const router = (0, express_1.Router)();
const gameController = new game_controller_1.GameController();
// Routes will be implemented later
router.post('/new', gameController.createGame);
router.post('/move', gameController.makeMove);
router.get('/state/:gameId', gameController.getGameState);
exports.default = router;
