import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

const EndGameModal = ({ visible, result, p1Score, p2Score, onRestart, onQuit }) => {
    
    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={[styles.title, result === 'win' ? styles.winText : styles.loseText]}>
                        {result === 'win' ? 'VICTOIRE !' : result === 'draw' ? 'ÉGALITÉ' : 'DÉFAITE...'}
                    </Text>
                    
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreDetail}>Votre score : {p1Score}</Text>
                        <Text style={styles.scoreDetail}>Adversaire : {p2Score}</Text>
                    </View>

                    <TouchableOpacity style={styles.buttonPrimary} onPress={onRestart}>
                        <Text style={styles.buttonText}>REVANCHE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonSecondary} onPress={onQuit}>
                        <Text style={styles.buttonTextSecondary}>RETOUR AU MENU</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '80%', backgroundColor: '#1a1a1a', padding: 30, borderRadius: 20, borderWidth: 2, borderColor: '#D4AF37', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
    winText: { color: '#00FF00', textShadowColor: 'rgba(0, 255, 0, 0.5)', textShadowRadius: 10 },
    loseText: { color: '#FF0000' },
    scoreContainer: { marginVertical: 20, alignItems: 'center' },
    scoreDetail: { color: '#FFF', fontSize: 18, marginBottom: 5 },
    buttonPrimary: { backgroundColor: '#D4AF37', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginBottom: 15 },
    buttonSecondary: { paddingVertical: 10 },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    buttonTextSecondary: { color: '#aaa', fontSize: 14, textDecorationLine: 'underline' }
});

export default EndGameModal;