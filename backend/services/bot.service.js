// backend/services/bot.service.js

const BotService = {
    // Analyse quels dés garder selon la difficulté
    decideDiceToLock: (dices, rollsCounter, difficulty) => {
        if (difficulty === 'easy') return []; // Facile : il ne locke rien, il joue au feeling
        
        const counts = Array(7).fill(0);
        dices.forEach(d => counts[parseInt(d.value)]++);
        
        const idsToLock = [];
        // Intermédiaire/Pro : On garde les doublons ou plus
        dices.forEach(dice => {
            const val = parseInt(dice.value);
            if (counts[val] >= 2) idsToLock.push(dice.id);
        });
        
        return idsToLock;
    },

    // Choisit la meilleure combinaison disponible
    chooseBestCombination: (availableChoices, difficulty) => {
        if (difficulty === 'easy') return availableChoices[Math.floor(Math.random() * availableChoices.length)];
        
        // Priorités pour Intermédiaire & Pro
        const weights = { 'yam': 10, 'carre': 9, 'full': 8, 'suite': 7, 'sec': 6, 'moinshuit': 5 };
        return availableChoices.sort((a, b) => (weights[b.id] || 0) - (weights[a.id] || 0))[0];
    },

    // Choisit la case sur la grille
    chooseGridCell: (grid, choiceId, difficulty, botPlayerKey) => {
        const availableCells = [];
        grid.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell.id === choiceId && cell.owner === null) {
                    availableCells.push({ rIdx, cIdx, cellId: cell.id });
                }
            });
        });

        if (difficulty === 'easy' || availableCells.length === 1) return availableCells[0];

        // Pour Pro/Intermédiaire : Idéalement, on coderait ici une détection d'alignement.
        // On va prendre la première par défaut pour l'instant, mais on pourra l'affiner.
        return availableCells[0];
    }
};

module.exports = BotService;