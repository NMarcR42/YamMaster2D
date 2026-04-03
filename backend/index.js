const express = require('express'); 
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const bodyParser = require('body-parser');
const uniqid = require('uniqid');

const io = require('socket.io')(http, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const GameService = require('./services/game.service');
const AuthController = require('./controllers/auth.controller');

app.use(cors()); 
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

// --- GESTION DES JEUX ---
let games = [];
let queue = [];

const updateClientsViewTimers = (game) => {
    if (game.player1Socket) game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    if (game.player2Socket) game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewDecks = (game) => {
    setTimeout(() => {
        if (game.player1Socket) game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
        if (game.player2Socket) game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
    }, 200);
};

const updateClientsViewChoices = (game) => {
    setTimeout(() => {
        if (game.player1Socket) game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
        if (game.player2Socket) game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
    }, 200);
};

const updateClientsViewGrid = (game) => {
    setTimeout(() => {
        if (game.player1Socket) game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
        if (game.player2Socket) game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
    }, 200);
};

const updateClientsViewScores = (game) => {
    const p1Data = { userScore: game.gameState.player1Score, userPions: game.gameState.player1Pions, opponentScore: game.gameState.player2Score, opponentPions: game.gameState.player2Pions };
    const p2Data = { userScore: game.gameState.player2Score, userPions: game.gameState.player2Pions, opponentScore: game.gameState.player1Score, opponentPions: game.gameState.player1Pions };
    if (game.player1Socket) game.player1Socket.emit('game.scores.view-state', p1Data);
    if (game.player2Socket) game.player2Socket.emit('game.scores.view-state', p2Data);
};

const createGame = (player1Socket, player2Socket) => {
    const gameData = GameService.init.gameState(); 
    const newGame = {
        idGame: uniqid(),
        player1Socket, player2Socket,
        player1Id: player1Socket.id, player2Id: player2Socket.id,
        player1Name: player1Socket.username || "Joueur 1", player2Name: player2Socket.username || "Joueur 2",
        player1Faction: player1Socket.faction || "horde", player2Faction: player2Socket.faction || "alliance",
        gameState: gameData.gameState 
    };

    games.push(newGame);
    player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', newGame));
    player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', newGame));
    
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
        } else {
            updateClientsViewTimers(activeGame);
        }
    }, 1000);
};

io.on('connection', socket => {
    socket.on('user.setup', (data) => { socket.username = data.username; });

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
        const combinations = GameService.choices.findCombinations(deck.dices, false, deck.rollsCounter === 1, game.gameState.grid);
        game.gameState.choices.availableChoices = combinations;

        if (deck.rollsCounter >= deck.rollsMaximum) {
            deck.dices = GameService.dices.lockEveryDice(deck.dices);
            game.gameState.timer = GameService.timer.getEndTurnDuration();
        }
        updateClientsViewDecks(game);
        updateClientsViewChoices(game);
        updateClientsViewTimers(game);
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
        const gs = game.gameState;
        const playerKey = socket.id === game.player1Id ? 'player:1' : 'player:2';

        if (gs.currentTurn !== playerKey) return;
        const cell = gs.grid[data.rowIndex][data.cellIndex];
        if (!cell || !cell.canBeChecked) return;

        gs.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, playerKey, gs.grid);
        gs.grid = GameService.grid.resetcanBeCheckedCells(gs.grid);

        if (playerKey === 'player:1') gs.player1Pions--; else gs.player2Pions--;

        const resP1 = GameService.grid.calculatePlayerScore(gs.grid, 'player:1');
        const resP2 = GameService.grid.calculatePlayerScore(gs.grid, 'player:2');
        gs.player1Score = resP1.score;
        gs.player2Score = resP2.score;

        // LOGIQUE VICTOIRE CORRIGÉE
        if (resP1.hasFiveAligned) gs.winner = 'player:1';
        else if (resP2.hasFiveAligned) gs.winner = 'player:2';
        else if (gs.player1Pions <= 0 || gs.player2Pions <= 0) {
            if (gs.player1Score === gs.player2Score) gs.winner = 'draw';
            else gs.winner = gs.player1Score > gs.player2Score ? 'player:1' : 'player:2';
        }

        if (gs.winner) {
            const finalData = { winner: gs.winner, p1Score: gs.player1Score, p2Score: gs.player2Score };
            if (game.player1Socket) game.player1Socket.emit('game.end', { ...finalData, isWinner: gs.winner === 'player:1' });
            if (game.player2Socket) game.player2Socket.emit('game.end', { ...finalData, isWinner: gs.winner === 'player:2' });
            setTimeout(() => { const idx = games.findIndex(g => g.idGame === game.idGame); if (idx !== -1) games.splice(idx, 1); }, 5000);
        } else {
            gs.currentTurn = gs.currentTurn === 'player:1' ? 'player:2' : 'player:1';
            gs.timer = GameService.timer.getTurnDuration();
            gs.deck = GameService.init.deck();
            gs.choices = GameService.init.choices();
            updateClientsViewTimers(game); updateClientsViewDecks(game); updateClientsViewChoices(game); updateClientsViewGrid(game); updateClientsViewScores(game);
        }
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

http.listen(3000, () => { console.log('Server running on port 3000'); });