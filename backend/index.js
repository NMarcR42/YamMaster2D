const express = require('express'); 
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const bodyParser = require('body-parser');
const uniqid = require('uniqid');
const PORT = process.env.PORT || 3005; 
const BIND_IP = '0.0.0.0';

const io = require('socket.io')(http, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] 
});

const GameService = require('./services/game.service');
const AuthController = require('./controllers/auth.controller');
const BotService = require('./services/bot.service'); 

app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

// --- ROUTES API ---
app.post('/api/register', async (req, res) => {
    const { username, password, faction } = req.body;
    res.json(await AuthController.register(username, password, faction));
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    res.json(await AuthController.login(username, password));
});

app.get('/api/leaderboard', async (req, res) => {
    res.json(await AuthController.getLeaderboard());
});

// --- GESTION DES JEUX (AVEC FIXES ANDROID) ---
let games = [];
let queue = [];

const updateClientsViewTimers = (game) => {
    if (game.player1Socket) {
        const t1 = GameService.send.forPlayer.gameTimer('player:1', game.gameState);
        game.player1Socket.emit('game.timer', {
            playerTimer: Number(t1.playerTimer || 0),
            opponentTimer: Number(t1.opponentTimer || 0)
        });
    }
    if (game.player2Socket) {
        const t2 = GameService.send.forPlayer.gameTimer('player:2', game.gameState);
        game.player2Socket.emit('game.timer', {
            playerTimer: Number(t2.playerTimer || 0),
            opponentTimer: Number(t2.opponentTimer || 0)
        });
    }
};

const updateClientsViewDecks = (game) => {
    setTimeout(() => {
        ['player:1', 'player:2'].forEach(pKey => {
            const socket = pKey === 'player:1' ? game.player1Socket : game.player2Socket;
            if (socket) {
                const data = GameService.send.forPlayer.deckViewState(pKey, game.gameState);
                if (data) {
                    data.displayRollButton = !!data.displayRollButton;
                    data.canRoll = !!data.canRoll;
                    if (data.dices) data.dices.forEach(d => d.locked = !!d.locked);
                }
                socket.emit('game.deck.view-state', data);
            }
        });
    }, 200);
};

const updateClientsViewChoices = (game) => {
    setTimeout(() => {
        ['player:1', 'player:2'].forEach(pKey => {
            const socket = pKey === 'player:1' ? game.player1Socket : game.player2Socket;
            if (socket) {
                const data = GameService.send.forPlayer.choicesViewState(pKey, game.gameState);
                if (data) {
                    data.displayChoices = !!data.displayChoices;
                    data.canMakeChoice = !!data.canMakeChoice;
                }
                socket.emit('game.choices.view-state', data);
            }
        });
    }, 200);
};

const updateClientsViewGrid = (game) => {
    setTimeout(() => {
        ['player:1', 'player:2'].forEach(pKey => {
            const socket = pKey === 'player:1' ? game.player1Socket : game.player2Socket;
            if (socket) {
                const data = GameService.send.forPlayer.gridViewState(pKey, game.gameState);
                if (data && data.grid) {
                    data.grid.forEach(row => {
                        if (row) row.forEach(cell => { if (cell) cell.canBeChecked = !!cell.canBeChecked; });
                    });
                }
                socket.emit('game.grid.view-state', data);
            }
        });
    }, 200);
};

const updateClientsViewScores = (game) => {
    const gs = game.gameState;
    const p1Data = { 
        userScore: Number(gs.player1Score || 0), userPions: Number(gs.player1Pions || 0), 
        opponentScore: Number(gs.player2Score || 0), opponentPions: Number(gs.player2Pions || 0) 
    };
    const p2Data = { 
        userScore: Number(gs.player2Score || 0), userPions: Number(gs.player2Pions || 0), 
        opponentScore: Number(gs.player1Score || 0), opponentPions: Number(gs.player1Pions || 0) 
    };
    if (game.player1Socket) game.player1Socket.emit('game.scores.view-state', p1Data);
    if (game.player2Socket) game.player2Socket.emit('game.scores.view-state', p2Data);
};

// --- LOGIQUE DU BOT ---
const triggerBotTurn = async (game) => {
    if (!game || !game.gameState || game.gameState.currentTurn !== 'player:2' || game.gameState.winner) return;
    try {
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        for (let i = 0; i < 3; i++) {
            const activeGame = games.find(g => g.idGame === game.idGame);
            if (!activeGame) return;
            await delay(1000);
            const deck = activeGame.gameState.deck;
            deck.dices = GameService.dices.roll(deck.dices);
            deck.rollsCounter++;
            activeGame.gameState.choices.availableChoices = GameService.choices.findCombinations(
                deck.dices, false, deck.rollsCounter === 1, activeGame.gameState.grid
            );
            updateClientsViewDecks(activeGame);
            updateClientsViewChoices(activeGame);
            if (deck.rollsCounter < deck.rollsMaximum) {
                const locks = BotService.decideDiceToLock(deck.dices, deck.rollsCounter, activeGame.difficulty);
                deck.dices.forEach(d => { if (locks.includes(d.id)) d.locked = true; });
                if (activeGame.difficulty === 'pro' && activeGame.gameState.choices.availableChoices.some(c => c.id === 'yam')) break;
            } else {
                deck.dices = GameService.dices.lockEveryDice(deck.dices);
                activeGame.gameState.timer = GameService.timer.getEndTurnDuration();
            }
            updateClientsViewDecks(activeGame);
        }
        await delay(1000);
        const choices = game.gameState.choices.availableChoices;
        if (!choices || choices.length === 0) return finalizeTurn(game); 
        const choice = BotService.chooseBestCombination(choices, game.difficulty);
        if (!choice || !choice.id) return finalizeTurn(game);
        game.gameState.choices.idSelectedChoice = choice.id;
        game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(choice.id, game.gameState.grid);
        updateClientsViewChoices(game);
        updateClientsViewGrid(game);
        await delay(1000);
        const cellCoords = BotService.chooseGridCell(game.gameState.grid, choice.id, game.difficulty, 'player:2');
        if (cellCoords && cellCoords.cellId && cellCoords.rIdx !== undefined) {
            handleGridSelection(game, 'player:2', cellCoords.cellId, cellCoords.rIdx, cellCoords.cIdx);
        } else {
            finalizeTurn(game);
        }
    } catch (error) {
        console.error("❌ ERREUR BOT :", error);
        if (game) finalizeTurn(game);
    }
};

const handleGridSelection = (game, playerKey, cellId, rowIndex, cellIndex) => {
    try {
        const gs = game.gameState;
        if (rowIndex === undefined || rowIndex === -1 || !gs.grid[rowIndex]) return finalizeTurn(game);
        const cell = gs.grid[rowIndex][cellIndex];
        if (!cell) return finalizeTurn(game);
        if (playerKey === 'player:1' && !cell.canBeChecked) return;

        gs.grid = GameService.grid.selectCell(cellId, rowIndex, cellIndex, playerKey, gs.grid);
        gs.grid = GameService.grid.resetcanBeCheckedCells(gs.grid);

        if (playerKey === 'player:1') gs.player1Pions--; else gs.player2Pions--;

        const resP1 = GameService.grid.calculatePlayerScore(gs.grid, 'player:1');
        const resP2 = GameService.grid.calculatePlayerScore(gs.grid, 'player:2');
        gs.player1Score = resP1.score;
        gs.player2Score = resP2.score;

        updateClientsViewScores(game);
        updateClientsViewGrid(game);

        if (resP1.hasFiveAligned) gs.winner = 'player:1';
        else if (resP2.hasFiveAligned) gs.winner = 'player:2';
        else if (gs.player1Pions <= 0 || gs.player2Pions <= 0) {
            if (gs.player1Score === gs.player2Score) gs.winner = 'draw';
            else gs.winner = gs.player1Score > gs.player2Score ? 'player:1' : 'player:2';
        }

        if (gs.winner) {
            const endData = { 
                winner: String(gs.winner), 
                p1Score: Number(gs.player1Score || 0), p2Score: Number(gs.player2Score || 0), 
                p1Id: String(game.player1Id || ""), p2Id: String(game.player2Id || "") 
            };
            if (game.player1Socket) game.player1Socket.emit('game.end', endData);
            if (game.player2Socket) game.player2Socket.emit('game.end', endData);
            setTimeout(() => { 
                const idx = games.findIndex(g => g.idGame === game.idGame); 
                if (idx !== -1) games.splice(idx, 1); 
            }, 5000);
        } else {
            finalizeTurn(game);
        }
    } catch (error) {
        console.error("❌ ERROR handleGridSelection:", error);
        finalizeTurn(game);
    }
};

const createGame = (player1Socket, player2Socket, isVsBot = false, difficulty = 'easy') => {
    const gameData = GameService.init.gameState(); 
    const newGame = {
        idGame: uniqid(),
        player1Socket, 
        player2Socket: isVsBot ? null : player2Socket,
        player1Id: player1Socket.id, 
        player2Id: isVsBot ? 'bot-id' : player2Socket.id,
        player1Name: String(player1Socket.username || "Joueur 1"), 
        player2Name: String(isVsBot ? `Bot (${difficulty.toUpperCase()})` : (player2Socket.username || "Joueur 2")),
        player1Faction: String(player1Socket.faction || "horde"), 
        player2Faction: String(isVsBot ? "alliance" : (player2Socket.faction || "alliance")),
        gameState: gameData.gameState,
        isVsBot: !!isVsBot,
        difficulty: String(difficulty)
    };

    newGame.gameState.player1Score = 0;
    newGame.gameState.player2Score = 0;
    newGame.gameState.player1Pions = 12; 
    newGame.gameState.player2Pions = 12;

    games.push(newGame);

    player1Socket.emit('game.start', {
        ...GameService.send.forPlayer.viewGameState('player:1', newGame),
        yourPlayerKey: 'player:1' 
    });

    if (player2Socket) {
        player2Socket.emit('game.start', {
            ...GameService.send.forPlayer.viewGameState('player:2', newGame),
            yourPlayerKey: 'player:2'
        });
    }
    
    updateClientsViewTimers(newGame);
    updateClientsViewDecks(newGame);
    updateClientsViewGrid(newGame);
    updateClientsViewScores(newGame);

    const gameInterval = setInterval(() => {
        const activeGame = games.find(g => g.idGame === newGame.idGame);
        if (!activeGame) { clearInterval(gameInterval); return; }

        activeGame.gameState.timer--;
        if (activeGame.gameState.timer <= 0) {
            activeGame.gameState.currentTurn = activeGame.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
            activeGame.gameState.timer = GameService.timer.getTurnDuration();
            activeGame.gameState.deck = GameService.init.deck();
            activeGame.gameState.choices = GameService.init.choices();
            activeGame.gameState.grid = GameService.grid.resetcanBeCheckedCells(activeGame.gameState.grid);
            
            updateClientsViewTimers(activeGame);
            updateClientsViewDecks(activeGame);
            updateClientsViewChoices(activeGame);
            updateClientsViewGrid(activeGame);
            updateClientsViewScores(activeGame);

            if (activeGame.gameState.currentTurn === 'player:2' && activeGame.isVsBot) triggerBotTurn(activeGame);
        } else {
            updateClientsViewTimers(activeGame);
        }
    }, 1000);
};

const finalizeTurn = (game) => {
    const gs = game.gameState;
    gs.currentTurn = gs.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    gs.timer = GameService.timer.getTurnDuration();
    gs.deck = GameService.init.deck();
    gs.choices = GameService.init.choices();
    
    updateClientsViewTimers(game); 
    updateClientsViewDecks(game); 
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
    updateClientsViewScores(game);

    if (gs.currentTurn === 'player:2' && game.isVsBot) triggerBotTurn(game);
};

io.on('connection', socket => {
    socket.on('user.setup', (data) => { socket.username = data.username; socket.faction = data.faction; });
    socket.on('game.vs-bot.start', (data) => { createGame(socket, null, true, data.difficulty); });
    socket.on('queue.join', (data) => {
        if (data && data.username) socket.username = data.username;
        if (!socket.username) return;
        queue.push(socket);
        if (queue.length >= 2) createGame(queue.shift(), queue.shift());
        else socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
    });
    socket.on('game.dices.roll', () => {
        const game = games.find(g => g.player1Id === socket.id || g.player2Id === socket.id);
        if (!game) return;
        const deck = game.gameState.deck;
        if (deck.rollsCounter >= deck.rollsMaximum) return;
        deck.dices = GameService.dices.roll(deck.dices);
        deck.rollsCounter++;
        game.gameState.choices.availableChoices = GameService.choices.findCombinations(deck.dices, false, deck.rollsCounter === 1, game.gameState.grid);
        if (deck.rollsCounter >= deck.rollsMaximum) {
            deck.dices = GameService.dices.lockEveryDice(deck.dices);
            game.gameState.timer = GameService.timer.getEndTurnDuration();
        }
        updateClientsViewDecks(game);
        updateClientsViewChoices(game);
        updateClientsViewTimers(game);
    });
    socket.on('game.dices.lock', (data) => {
        const game = games.find(g => g.player1Id === socket.id || g.player2Id === socket.id);
        if (!game) return;
        const playerKey = socket.id === game.player1Id ? 'player:1' : 'player:2';
        if (game.gameState.currentTurn !== playerKey) return;
        const dice = game.gameState.deck.dices.find(d => d.id === data.diceId);
        if (dice) { dice.locked = !dice.locked; updateClientsViewDecks(game); }
    });
    socket.on('game.choices.selected', (data) => {
        const game = games.find(g => g.player1Id === socket.id || g.player2Id === socket.id);
        if (!game) return;
        game.gameState.choices.idSelectedChoice = data.choiceId;
        game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
        game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, game.gameState.grid);
        updateClientsViewChoices(game);
        updateClientsViewGrid(game);
    });
    socket.on('game.grid.selected', (data) => {
        const game = games.find(g => g.player1Id === socket.id || g.player2Id === socket.id);
        if (!game) return;
        const playerKey = socket.id === game.player1Id ? 'player:1' : 'player:2';
        if (game.gameState.currentTurn !== playerKey) return;
        handleGridSelection(game, playerKey, data.cellId, data.rowIndex, data.cellIndex);
    });
    socket.on('disconnect', () => {
        queue = queue.filter(s => s.id !== socket.id);
        const gIdx = games.findIndex(g => g.player1Id === socket.id || g.player2Id === socket.id);
        if (gIdx !== -1) {
            const opp = socket.id === games[gIdx].player1Id ? games[gIdx].player2Socket : games[gIdx].player1Socket;
            if (opp) opp.emit('opponent.left');
            games.splice(gIdx, 1);
        }
    });
});

http.listen(PORT, BIND_IP, () => {
    console.log(`✅ Serveur Yam Master actif sur http://${BIND_IP}:${PORT}`);
});