import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = ({ factionColor }) => {
    const { socket } = useContext(SocketContext);
    const [grid, setGrid] = useState([]);
    const [yourPlayerKey, setYourPlayerKey] = useState(null); 

    useEffect(() => {
        if (!socket) return;
        socket.on("game.grid.view-state", (data) => {
            setGrid(data['grid']);
            setYourPlayerKey(data['yourPlayerKey']); 
        });
        return () => socket.off("game.grid.view-state");
    }, [socket]);

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
    };

    return (
        <View style={styles.grid}>
            {grid.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((cell, cellIndex) => {
                        // LOGIQUE DE COULEUR DYNAMIQUE
                        const isMine = cell.owner === yourPlayerKey;
                        const isOpponent = cell.owner !== null && cell.owner !== yourPlayerKey;

                        return (
                            <TouchableOpacity
                                key={`${rowIndex}-${cellIndex}`}
                                style={[
                                    styles.cell,
                                    isMine && { backgroundColor: factionColor },
                                    isOpponent && { backgroundColor: '#000' }, // Noir pour l'adversaire
                                    cell.canBeChecked && styles.playable
                                ]}
                                onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                disabled={!cell.canBeChecked}
                            >
                                <Text style={[
                                    styles.cellText, 
                                    (isMine || isOpponent) && { color: '#FFF' }
                                ]}>
                                    {cell.viewContent}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: { flex: 1 },
    row: { flex: 1, flexDirection: 'row' },
    cell: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 0.5, 
        borderColor: 'rgba(212, 175, 55, 0.2)' 
    },
    cellText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 12 },
    playable: { 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderWidth: 1, 
        borderColor: '#FFF' 
    }
});

export default Grid;