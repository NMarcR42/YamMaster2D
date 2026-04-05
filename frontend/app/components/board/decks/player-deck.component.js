import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";

const PlayerDeck = ({ factionColor }) => {
  const { socket } = useContext(SocketContext);
  const [deckData, setDeckData] = useState({ dices: [], displayRollButton: false, rollsCounter: 0 });

  useEffect(() => {
    if (!socket) return;
    socket.on("game.deck.view-state", (data) => setDeckData(data));
    return () => socket.off("game.deck.view-state");
  }, [socket]);

  // Si on n'a pas de dés à afficher pour ce joueur, on ne rend rien ou un espace vide
  if (deckData.dices.length === 0 && !deckData.displayRollButton) {
      return <View style={styles.container} />; 
  }

  return (
    <View style={styles.container}>
      <View style={styles.diceRow}>
        {deckData.dices.map((dice) => (
          <Dice
              key={dice.id}
              locked={dice.locked}
              value={dice.value}
              
              onPress={() => socket.emit("game.dices.lock", { diceId: dice.id })} 
          />
      ))}
      </View>

      {deckData.displayRollButton && (
        <TouchableOpacity 
            style={[styles.rollBtn, { backgroundColor: factionColor }]} 
            onPress={() => socket.emit("game.dices.roll")}
        >
          <Text style={styles.rollText}>LANCER LES DÉS ({deckData.rollsCounter}/3)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  diceRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  rollBtn: { width: '85%', paddingVertical: 12, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  rollText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});

export default PlayerDeck;