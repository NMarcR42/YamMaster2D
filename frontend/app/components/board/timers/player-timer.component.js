import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";   

const PlayerTimer = ({ factionColor }) => {
  const { socket } = useContext(SocketContext);
  const [playerTimer, setPlayerTimer] = useState(0);

  useEffect(() => {
    socket.on("game.timer", (data) => {
      setPlayerTimer(data['playerTimer']);
    });
    return () => socket.off("game.timer");
  }, []);

  return (
    <View>
      <Text style={[
          styles.timerText, 
          { color: factionColor, textShadowColor: factionColor }
      ]}>
        {playerTimer}s
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
    timerText: {
        fontSize: 22,
        fontWeight: "bold",
        fontFamily: "monospace",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    }
});

export default PlayerTimer;