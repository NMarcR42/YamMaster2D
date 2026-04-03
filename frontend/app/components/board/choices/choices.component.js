import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';

const Choices = ({ factionColor }) => {
    // CORRECTION ICI : Ajout des accolades { }
    const { socket } = useContext(SocketContext);

    const [displayChoices, setDisplayChoices] = useState(false);
    const [canMakeChoice, setCanMakeChoice] = useState(false);
    const [idSelectedChoice, setIdSelectedChoice] = useState(null);
    const [availableChoices, setAvailableChoices] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.on("game.choices.view-state", (data) => {
            setDisplayChoices(data['displayChoices']);
            setCanMakeChoice(data['canMakeChoice']);
            setIdSelectedChoice(data['idSelectedChoice']);
            setAvailableChoices(data['availableChoices']);
        });

        return () => socket.off("game.choices.view-state");
    }, [socket]);

    const handleSelectChoice = (choiceId) => {
        if (canMakeChoice) {
            socket.emit("game.choices.selected", { choiceId });
        }
    };

    return (
        <View style={styles.mainContainer}>
            <Text style={[styles.title, { color: factionColor || '#D4AF37' }]}>COMBINAISONS</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {displayChoices && availableChoices.map((choice) => (
                    <TouchableOpacity
                        key={choice.id}
                        style={[
                            styles.choiceButton,
                            idSelectedChoice === choice.id && { backgroundColor: factionColor || '#D4AF37' },
                            !canMakeChoice && styles.disabledChoice
                        ]}
                        onPress={() => handleSelectChoice(choice.id)}
                        disabled={!canMakeChoice}
                    >
                        <Text style={[
                            styles.choiceText,
                            idSelectedChoice === choice.id && { color: '#000' }
                        ]}>
                            {choice.value}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, padding: 5 },
    title: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    choiceButton: { 
        backgroundColor: "#1a1a1a", 
        borderRadius: 5, 
        padding: 8, 
        marginVertical: 2, 
        borderWidth: 1, 
        borderColor: '#444' 
    },
    choiceText: { color: '#D4AF37', fontSize: 11, textAlign: 'center', fontWeight: 'bold' },
    disabledChoice: { opacity: 0.3 }
});

export default Choices;