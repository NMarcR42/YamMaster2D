// backend/services/game.service.js

// Durée d'un tour en secondes
const TURN_DURATION = 60;

const DECK_INIT = {
    dices: [
        { id: 1, value: '', locked: false },
        { id: 2, value: '', locked: false },
        { id: 3, value: '', locked: false },
        { id: 4, value: '', locked: false },
        { id: 5, value: '', locked: false },
    ],
    rollsCounter: 0,
    rollsMaximum: 3
};

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const ALL_COMBINATIONS = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];

const GRID_INIT = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: TURN_DURATION,
        player1Score: 0,
        player2Score: 0,
        player1Pions: 12,
        player2Pions: 12,
        grid: [],
        choices: {},
        deck: {}
    }
};

const GameService = {
    init: {
        gameState: () => {
            const game = { ...GAME_INIT };
            game['gameState'] = { ...GAME_INIT['gameState'] };
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['choices'] = { ...CHOICES_INIT };
            game['gameState']['grid'] = JSON.parse(JSON.stringify(GRID_INIT));
            game['gameState']['deck'] = { ...DECK_INIT };
            return game;
        },
        deck: () => ({ ...DECK_INIT }),
        choices: () => ({ ...CHOICES_INIT }),
        grid: () => ({ ...GRID_INIT })
    },

    send: {
        forPlayer: {
            // FIX: Cette fonction est appelée par index.js lors du queue.join
            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false
                };
            },

            viewGameState: (playerKey, game) => {
                const isP1 = playerKey === 'player:1';
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer: isP1 ? game.player1Id : game.player2Id,
                    idOpponent: isP1 ? game.player2Id : game.player1Id,
                    userName: isP1 ? game.player1Name : game.player2Name,
                    userFaction: isP1 ? game.player1Faction : game.player2Faction,
                    opponentName: isP1 ? game.player2Name : game.player1Name,
                    opponentFaction: isP1 ? game.player2Faction : game.player1Faction,
                };
            },

            gameTimer: (playerKey, gameState) => {
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return { playerTimer, opponentTimer };
            },

            deckViewState: (playerKey, gameState) => {
                const isMyTurn = gameState.currentTurn === playerKey;
                
                return {
                    displayPlayerDeck: isMyTurn,
                    displayOpponentDeck: !isMyTurn,
                    displayRollButton: isMyTurn && (gameState.deck.rollsCounter < gameState.deck.rollsMaximum),
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    // Si c'est mon tour, j'envoie mes dés. Sinon, j'envoie un tableau vide.
                    dices: isMyTurn ? gameState.deck.dices : [], 
                    // Si ce n'est PAS mon tour, j'affiche les dés de celui qui joue en haut.
                    opponentDices: !isMyTurn ? gameState.deck.dices : []  
                };
            },

            choicesViewState: (playerKey, gameState) => {
                return {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                };
            },

            gridViewState: (playerKey, gameState) => {
                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid,
                    yourPlayerKey: playerKey 
                };
            }
        }
    },

    utils: {
        findGameIndexById: (games, idGame) => games.findIndex(g => g.idGame === idGame),
        findGameIndexBySocketId: (games, socketId) => 
            games.findIndex(g => g.player1Socket.id === socketId || g.player2Socket.id === socketId),
        findDiceIndexByDiceId: (dices, idDice) => dices.findIndex(d => d.id === idDice)
    },

    dices: {
        roll: (dicesToRoll) => {
            return dicesToRoll.map(dice => {
            // On lance si : valeur vide (1er tour) OU si non locké
            if (dice.value === "" || !dice.locked) {
                return {
                    ...dice,
                    value: String(Math.floor(Math.random() * 6) + 1),
                    locked: false // On déverrouille après un lancer pour forcer le joueur à re-cliquer
                };
            }
            return dice;
            });
        },
        lockEveryDice: (dicesToLock) => dicesToLock.map(dice => ({ ...dice, locked: true }))
    },

    choices: {
        findCombinations: (dices, isDefi, isSec, grid) => {
            const availableCombinations = [];
            const counts = Array(7).fill(0);
            let sum = 0;

            dices.forEach(dice => {
                const val = parseInt(dice.value);
                counts[val]++;
                sum += val;
            });

            const hasThreeOfAKind = counts.some(c => c >= 3);
            const threeOfAKindValue = counts.findIndex(c => c >= 3);
            const hasPair = counts.some(c => c >= 2);
            const hasFourOfAKind = counts.some(c => c >= 4);
            const hasFiveOfAKind = counts.some(c => c === 5);
            
            const sortedValues = [...new Set(dices.map(d => parseInt(d.value)))].sort();
            const hasStraight = sortedValues.length >= 5 && (sortedValues[4] - sortedValues[0] === 4);

            ALL_COMBINATIONS.forEach(combo => {
                if (
                    (combo.id.includes('brelan') && hasThreeOfAKind && parseInt(combo.id.slice(-1)) === threeOfAKindValue) ||
                    (combo.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combo.id === 'carre' && hasFourOfAKind) ||
                    (combo.id === 'yam' && hasFiveOfAKind) ||
                    (combo.id === 'suite' && hasStraight) ||
                    (combo.id === 'moinshuit' && sum <= 8) ||
                    (combo.id === 'defi' && isDefi)
                ) {
                    availableCombinations.push(combo);
                }
            });

            if (isSec && availableCombinations.length > 0 && availableCombinations.some(c => !c.id.includes('brelan'))) {
                availableCombinations.push(ALL_COMBINATIONS.find(c => c.id === 'sec'));
            }

            return availableCombinations.filter(combo => {
                return grid.some(row => row.some(cell => cell.id === combo.id && cell.owner === null));
            });
        }
    },

    grid: {
        resetcanBeCheckedCells: (grid) => grid.map(row => row.map(c => ({ ...c, canBeChecked: false }))),
        
        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {
            return grid.map(row => row.map(cell => {
                if (cell.id === idSelectedChoice && cell.owner === null) {
                    return { ...cell, canBeChecked: true };
                }
                return cell;
            }));
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            return grid.map((row, rIdx) => row.map((cell, cIdx) => {
                if (cell.id === idCell && rIdx === rowIndex && cIdx === cellIndex) {
                    return { ...cell, owner: currentTurn, canBeChecked: false };
                }
                return cell;
            }));
        },

        calculatePlayerScore: (grid, playerKey) => {
            let totalScore = 0;
            let hasFiveAligned = false;

            // Fonction CRUCIALE : Compte le max de pions CONSÉCUTIFS dans un tableau de cellules
            const getMaxConsecutive = (cells) => {
                let maxConsecutive = 0;
                let currentConsecutive = 0;

                cells.forEach(cell => {
                    if (cell && cell.owner === playerKey) {
                        currentConsecutive++;
                        if (currentConsecutive > maxConsecutive) {
                            maxConsecutive = currentConsecutive;
                        }
                    } else {
                        currentConsecutive = 0;
                    }
                });
                return maxConsecutive;
            };

            const updateScoreFromConsecutive = (count) => {
                if (count >= 5) { hasFiveAligned = true; return 3; }
                if (count === 4) return 2;
                if (count === 3) return 1;
                return 0;
            };

            // 1. Horizontales (Lignes)
            for (let i = 0; i < 5; i++) {
                totalScore += updateScoreFromConsecutive(getMaxConsecutive(grid[i]));
            }

            // 2. Verticales (Colonnes)
            for (let i = 0; i < 5; i++) {
                totalScore += updateScoreFromConsecutive(getMaxConsecutive(grid.map(row => row[i])));
            }

            // 3. Diagonales Descendantes (\)
            const diagDesc = [
                [grid[0][0], grid[1][1], grid[2][2], grid[3][3], grid[4][4]], // Grande
                [grid[0][1], grid[1][2], grid[2][3], grid[3][4]],             // 4 cases
                [grid[1][0], grid[2][1], grid[3][2], grid[4][3]],             // 4 cases
                [grid[0][2], grid[1][3], grid[2][4]],                         // 3 cases
                [grid[2][0], grid[3][1], grid[4][2]]                          // 3 cases
            ];
            diagDesc.forEach(line => {
                totalScore += updateScoreFromConsecutive(getMaxConsecutive(line));
            });

            // 4. Diagonales Ascendantes (/)
            const diagAsc = [
                [grid[4][0], grid[3][1], grid[2][2], grid[1][3], grid[0][4]], // Grande
                [grid[3][0], grid[2][1], grid[1][2], grid[0][3]],             // 4 cases
                [grid[4][1], grid[3][2], grid[2][3], grid[1][4]],             // 4 cases
                [grid[2][0], grid[1][1], grid[0][2]],                         // 3 cases
                [grid[4][2], grid[3][3], grid[2][4]]                          // 3 cases
            ];
            diagAsc.forEach(line => {
                totalScore += updateScoreFromConsecutive(getMaxConsecutive(line));
            });

            return { score: totalScore, hasFiveAligned };
        }
    },
    timer: {
        getTurnDuration: () => TURN_DURATION,
        getEndTurnDuration: () => 5
    }
    
};

module.exports = GameService;