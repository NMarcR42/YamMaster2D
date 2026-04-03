import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";   

const OpponentTimer = () => {
    // CORRECTION ICI : Ajout des accolades { }
    const { socket } = useContext(SocketContext); 
    const [opponentTimer, setOpponentTimer] = useState(0);

    useEffect(() => {
        if (!socket) return;

        socket.on("game.timer", (data) => {
            setOpponentTimer(data['opponentTimer']);
        });

        return () => socket.off("game.timer");
    }, [socket]);

    return (
        <View>
            <Text style={styles.timerText}>{opponentTimer}s</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    timerText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFF",
        fontFamily: "monospace",
    }
});

export default OpponentTimer;