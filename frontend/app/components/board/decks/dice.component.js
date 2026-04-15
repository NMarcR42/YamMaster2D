import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

const Dice = ({ index, locked, value, onPress, opponent, rolling }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rolling && !locked) {
      // Animation de vibration quand on lance les dés
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
        { iterations: 5 }
      ).start();
    }
  }, [rolling]);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      <TouchableOpacity
        style={[
          styles.dice,
          locked ? styles.lockedDice : styles.activeDice,
          opponent && styles.opponentDice
      ]}
      onPress={onPress}
      disabled={!!opponent}
      >
        <Text style={[styles.diceText, locked && styles.lockedText]}>{value ? String(value) : ""} </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  dice: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    elevation: 5, // Ombre Android
    shadowColor: "#000", // Ombre iOS
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
  },
  activeDice: {
    backgroundColor: "#F5F5F5", // Blanc ivoire
    borderColor: "#D4AF37", // Or
  },
  lockedDice: {
    backgroundColor: "#222", // Noir charbon
    borderColor: "#444",
  },
  opponentDice: {
    width: 35,
    height: 35,
    opacity: 0.8,
  },
  diceText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  lockedText: {
    color: "#D4AF37", // Texte or sur dé noir
  },
});

export default Dice;