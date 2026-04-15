import React, { useContext, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SocketContext } from "../contexts/socket.context";
import Board from "../components/board/board.component";
import EndGameModal from "../components/modals/end-game.modal";

export default function OnlineGameController({ user, factionColor, gameData, navigation }) {
    const { socket, isConnected } = useContext(SocketContext);

    // Initialisation cohérente avec le serveur (22 pions)
    const [scores, setScores] = useState({
        userScore: 0,
        userPions: 22,
        opponentScore: 0,
        opponentPions: 22
    });

    const [endGame, setEndGame] = useState({
        visible: false,
        result: 'draw',
        p1Score: 0,
        p2Score: 0
    });

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Mise à jour des scores
        socket.on('game.scores.view-state', (data) => {
            setScores(data);
        });

        // Fin de partie
        socket.on('game.end', (data) => {
            const isPlayer1 = socket.id === data.p1Id;
            const myKey = isPlayer1 ? 'player:1' : 'player:2';
            
            let result = 'draw';
            if (data.winner !== 'draw') {
                result = (data.winner === myKey) ? 'win' : 'lose';
            }

            setEndGame({
                visible: true,
                result: result,
                p1Score: data.p1Score, 
                p2Score: data.p2Score 
            });
        });

        return () => {
            socket.off('game.scores.view-state');
            socket.off('game.end');
        };
    }, [socket, isConnected]);

    const handleRestart = () => {
        setEndGame({ ...endGame, visible: false });
        socket.emit('queue.join', { username: user.username }); 
    };

    const handleQuit = () => {
        setEndGame({ ...endGame, visible: false });
        // Retour au menu de sélection (Online ou Bot)
        // Remplace 'GameSelection' par le nom exact de ta route menu
        navigation.navigate('GameSelection'); 
    };

    return (
        <View style={styles.fullScreen}>
            <Board 
                player1Name={gameData?.userName || user.username}
                player1Faction={gameData?.userFaction || user.faction}
                player1Score={scores.userScore}  
                player1Pions={scores.userPions}
                player2Name={gameData?.opponentName || "Adversaire"}
                player2Faction={gameData?.opponentFaction}
                player2Score={scores.opponentScore} 
                player2Pions={scores.opponentPions} 
                yourPlayerKey={'player:1'} 
                factionColor={factionColor} 
            />

            <EndGameModal 
                visible={endGame.visible}
                result={endGame.result}
                p1Score={endGame.p1Score}
                p2Score={endGame.p2Score}
                onRestart={handleRestart}
                onQuit={handleQuit}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreen: { flex: 1, backgroundColor: '#065535' }
});