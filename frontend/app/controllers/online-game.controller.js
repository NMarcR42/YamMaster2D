import React, { useContext, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SocketContext } from "../contexts/socket.context";
import Board from "../components/board/board.component";
import EndGameModal from "../components/modals/end-game.modal";

export default function OnlineGameController({ user, factionColor, gameData, navigation }) {
    // 1. On récupère socket ET isConnected
    const { socket, isConnected } = useContext(SocketContext);

    const [scores, setScores] = useState({
        userScore: 0,
        userPions: 12,
        opponentScore: 0,
        opponentPions: 12
    });

    const [endGame, setEndGame] = useState({
        visible: false,
        result: 'draw',
        p1Score: 0,
        p2Score: 0
    });

    useEffect(() => {
        // 2. Vérification sécurisée
        if (!socket || !isConnected) return;

        socket.on('game.scores.view-state', (data) => {
            setScores(data);
        });

        socket.on('game.end', (data) => {
            let result = 'draw';
            if (data.winner !== 'draw') {
                // On compare l'ID du joueur local avec celui du player1 de la game
                const myKey = gameData.idPlayer === socket.id ? 'player:1' : 'player:2';
                result = data.winner === myKey ? 'win' : 'lose';
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
        socket.emit('queue.join'); // Rejoint une nouvelle file
    };

    const handleQuit = () => {
        setEndGame({ ...endGame, visible: false });
        // navigation.navigate('Home'); // Si tu as un router
    };

    return (
        <View style={styles.fullScreen}>
            <Board 
                // Identité
                username={gameData?.userName || user.username} 
                userFaction={gameData?.userFaction || user.faction}
                opponentName={gameData?.opponentName || "Adversaire"}
                opponentFaction={gameData?.opponentFaction}
                
                // Scores et Pions (Vient du state synchronisé avec le serveur)
                userScore={scores.userScore}
                userPions={scores.userPions}
                opponentScore={scores.opponentScore}
                opponentPions={scores.opponentPions}
                
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