//frontend\app\screens\mode-selection.screen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function ModeSelectionScreen({ navigation, route }) {
    const { user } = route.params; 
    const isAlliance = user.faction === 'alliance';
    const factionColor = isAlliance ? '#1e90ff' : '#8b0000';

    return (
        <View style={styles.container}>
            <Image source={{ uri: user.avatar_url }} style={[styles.avatar, { borderColor: factionColor }]} />
            <Text style={styles.welcomeText}>BIENVENUE, {user.username.toUpperCase()}</Text>
            <Text style={[styles.rankText, { color: factionColor }]}>{user.rank_name.toUpperCase()}</Text>
            
            <TouchableOpacity 
                style={[styles.modeButton, { borderColor: factionColor }]} 
                onPress={() => navigation.navigate('OnlineGameScreen')}
            >
                <Text style={styles.btnText}>MULTIJOUEUR (MATCHMAKING)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.modeButton, { marginTop: 20, borderColor: '#666' }]} 
                onPress={() => navigation.navigate('VsBotGameScreen')}
            >
                <Text style={styles.btnText}>CONTRE LE BOT (ENTRAINEMENT)</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, marginBottom: 20 },
    welcomeText: { fontSize: 22, color: '#D4AF37', fontWeight: 'bold', letterSpacing: 2 },
    rankText: { fontSize: 14, fontWeight: 'bold', marginBottom: 40, letterSpacing: 3 },
    modeButton: { width: '100%', paddingVertical: 20, backgroundColor: '#111', borderWidth: 2, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});