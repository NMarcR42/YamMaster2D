// app/screens/vs-bot-game.screen.js
import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import OnlineGameController from "../controllers/online-game.controller"; 

export default function VsBotGameScreen({ navigation }) {
    const { socket, user } = useContext(SocketContext);
    const [inGame, setInGame] = useState(false);
    const [gameData, setGameData] = useState(null);

    // Calcul de la couleur de faction comme dans OnlineGameScreen
    const factionColor = user?.faction === 'alliance' ? '#1e90ff' : '#8b0000';

    const startBotGame = (difficulty) => {
        if (!socket) return;
        socket.emit('game.vs-bot.start', { difficulty });
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('game.start', (data) => {
            setGameData(data);
            setInGame(true);
        });

        return () => {
            socket.off('game.start');
        };
    }, [socket]);

    // Si le jeu est lancé, on utilise le Controller avec la factionColor calculée
    if (inGame && gameData) {
        return (
            <OnlineGameController 
                user={user} 
                factionColor={factionColor} 
                gameData={gameData} 
            />
        );
    }

    return (
        <View style={[styles.container, { paddingTop: 40 }]}>
            <Text style={[styles.title, { color: factionColor || '#8b0000' }]}>MODE VS BOT</Text>
            
            <View style={styles.menu}>
                <DifficultyBtn 
                    label="FACILE" 
                    color="#4CAF50" 
                    onPress={() => startBotGame('easy')} 
                />
                <DifficultyBtn 
                    label="INTERMÉDIAIRE" 
                    color="#FF9800" 
                    onPress={() => startBotGame('intermediate')} 
                />
                <DifficultyBtn 
                    label="PRO" 
                    color="#F44336" 
                    onPress={() => startBotGame('pro')} 
                />
            </View>

            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backText}>RETOUR</Text>
            </TouchableOpacity>
        </View>
    );
}

const DifficultyBtn = ({ label, color, onPress }) => (
    <TouchableOpacity style={[styles.btn, { borderColor: color }]} onPress={onPress}>
        <Text style={[styles.btnText, { color: color }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#000", 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        marginBottom: 60, 
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    menu: { width: '80%' },
    btn: { 
        borderWidth: 2, 
        padding: 20, 
        borderRadius: 15, 
        alignItems: 'center', 
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
    btnText: { fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
    backButton: { marginTop: 20 },
    backText: { color: '#666', fontSize: 14, textDecorationLine: 'underline' }
});