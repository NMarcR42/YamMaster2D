import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";

const OpponentDeck = () => {
    const { socket } = useContext(SocketContext);
    // On initialise à vide
    const [dices, setDices] = useState([]);

    useEffect(() => {
        if (!socket) return;
        socket.on("game.deck.view-state", (data) => {
            // On ne met à jour que si opponentDices contient quelque chose
            // Sinon on vide (pour cacher les dés quand le tour change)
            setDices(data.opponentDices || []);
        });
        return () => socket.off("game.deck.view-state");
    }, [socket]);

    if (dices.length === 0) return <View style={{ height: 45 }} />; // Espace vide si pas de dés

    return (
        <View style={styles.container}>
            {dices.map((dice, index) => (
                <Dice 
                    key={`opp-dice-${index}`} 
                    value={dice.value} 
                    locked={dice.locked} 
                    opponent={true} 
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'center', opacity: 0.6 }
});

export default OpponentDeck;