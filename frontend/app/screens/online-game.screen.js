import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert, View } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import OnlineGameController from "../controllers/online-game.controller";

export default function OnlineGameScreen({ navigation }) {
    const { socket, user, isConnected } = useContext(SocketContext);
    const [isSearching, setIsSearching] = useState(true);
    const [gameData, setGameData] = useState(null);

    useEffect(() => {
        if (!user || !socket) return;

        // On n'émet que si le socket est réellement connecté
        if (isConnected) {
            socket.emit('queue.join');
        }

        socket.on('game.start', (data) => {
            setGameData(data);
            setIsSearching(false);
        });

        socket.on('opponent.left', () => {
            Alert.alert("Fin de partie", "L'adversaire a quitté.");
            navigation.navigate('ModeSelectionScreen');
        });

        return () => {
            socket.off('game.start');
            socket.off('opponent.left');
            socket.emit('queue.leave'); 
        };
    }, [isConnected]);

    const factionColor = user?.faction === 'alliance' ? '#1e90ff' : '#8b0000';

    if (isSearching) {
        return (
            <View style={[styles.waitingContainer, { paddingTop: 40 }]}> 
                <ActivityIndicator size="large" color={factionColor || "#8b0000"} />
                <Text style={[styles.waitingTitle, { color: factionColor }]}>
                    {isConnected ? "RECHERCHE D'UN ADVERSAIRE..." : "CONNEXION AU SERVEUR..."}
                </Text>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>ANNULER</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <OnlineGameController 
            user={user} 
            factionColor={factionColor} 
            gameData={gameData} 
        />
    );
}

const styles = StyleSheet.create({
    waitingContainer: { 
        flex: 1, 
        backgroundColor: '#000', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    waitingTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginTop: 20, 
        textAlign: 'center' 
    },
    cancelButton: { 
        marginTop: 40 
    },
    cancelText: { 
        color: '#666', 
        textDecorationLine: 'underline' 
    }
});