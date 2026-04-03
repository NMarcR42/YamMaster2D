import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, Alert } from "react-native";
import { SocketContext } from "../contexts/socket.context";

export default function HomeScreen({ navigation }) {
    const { user, setUser, socket } = useContext(SocketContext);
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', faction: 'horde' });
    const [leaderboard, setLeaderboard] = useState([]);

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    // Couleurs dynamiques basées sur la faction sélectionnée dans le formulaire (avant login)
    // ou la faction de l'utilisateur (après login)
    const currentFaction = user ? user.faction : form.faction;
    const factionColor = currentFaction === 'alliance' ? '#1e90ff' : '#8b0000';
    const factionName = currentFaction === 'alliance' ? 'ALLIANCE' : 'HORDE';

    useEffect(() => {
        const fetchLB = async () => {
            try {
                const res = await fetch(`${API_URL}/api/leaderboard`);
                const data = await res.json();
                setLeaderboard(data);
            } catch (e) { console.log("LB Fetch Error", e); }
        };
        fetchLB();
    }, [user]);

    const handleAuth = async () => {
        const path = isRegister ? '/api/register' : '/api/login';
        try {
            const res = await fetch(`${API_URL}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isRegister ? form : { username: form.username, password: form.password })
            });
            const data = await res.json();

            if (data.success) {
                // 1. On connecte le socket manuellement (car autoConnect est à false)
                socket.connect();

                // 2. Mise à jour du contexte global
                setUser(data.user);

                // 3. Identification auprès du serveur socket
                socket.emit('user.setup', { username: data.user.username });

                // 4. NAVIGATION : Redirection immédiate
                navigation.navigate('ModeSelectionScreen', { user: data.user });

            } else {
                Alert.alert("Accès refusé", data.error);
            }
        } catch (e) {
            Alert.alert("Erreur", "Le Grand Conseil est injoignable.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
                <View style={styles.header}>
                    <Text style={styles.titleGold}>YAM MASTER</Text>
                    <Text style={[styles.subtitle, { color: factionColor }]}>
                        {user ? `${factionName} CASINO EDITION` : "CHAMP DE BATAILLE DES DÉS"}
                    </Text>
                </View>

                {!user ? (
                    <View style={[styles.authCard, { borderLeftColor: factionColor }]}>
                        {isRegister && (
                            <View style={styles.factionPicker}>
                                <TouchableOpacity
                                    style={[styles.fBtn, form.faction === 'horde' && styles.fBtnHorde]}
                                    onPress={() => setForm({ ...form, faction: 'horde' })}>
                                    <Text style={styles.fBtnText}>HORDE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.fBtn, form.faction === 'alliance' && styles.fBtnAlliance]}
                                    onPress={() => setForm({ ...form, faction: 'alliance' })}>
                                    <Text style={styles.fBtnText}>ALLIANCE</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="PSEUDO"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                            onChangeText={t => setForm({ ...form, username: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="MOT DE PASSE"
                            secureTextEntry
                            placeholderTextColor="#666"
                            onChangeText={t => setForm({ ...form, password: t })}
                        />
                        <TouchableOpacity
                            style={[styles.hordeButton, { backgroundColor: factionColor }]}
                            onPress={handleAuth}>
                            <Text style={styles.buttonText}>{isRegister ? "REJOINDRE" : "S'IDENTIFIER"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
                            <Text style={styles.switchText}>
                                {isRegister ? "Déjà membre ? Se connecter" : "Nouveau ? Créer un compte"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* Vue de transition si l'utilisateur est déjà chargé mais pas encore redirigé */
                    <View style={styles.profileCard}>
                        <Text style={styles.userName}>CHARGEMENT DES ARMÉES...</Text>
                    </View>
                )}

                <View style={styles.leaderboard}>
                    <Text style={styles.lbTitle}>CLASSEMENT DES GLADIATEURS</Text>
                    {leaderboard.map((item, index) => (
                        <View key={index} style={styles.lbRow}>
                            <Text style={styles.lbRank}>#{index + 1}</Text>
                            <Text style={[styles.lbName, { color: item.badge_color || '#fff' }]}>{item.username}</Text>
                            <Text style={styles.lbXp}>{item.xp} XP</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0a0a0a" },
    header: { marginVertical: 30, alignItems: 'center' },
    titleGold: { color: '#D4AF37', fontSize: 42, fontWeight: 'bold', letterSpacing: 2 },
    subtitle: { fontSize: 12, letterSpacing: 4, fontWeight: 'bold' },
    authCard: { width: '85%', backgroundColor: '#151515', padding: 20, borderRadius: 10, borderLeftWidth: 6 },
    input: { backgroundColor: '#000', color: '#fff', padding: 15, borderRadius: 5, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
    hordeButton: { padding: 18, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    switchText: { color: '#666', textAlign: 'center', marginTop: 15 },
    profileCard: { alignItems: 'center', width: '85%' },
    userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    leaderboard: { width: '85%', marginTop: 40, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 20 },
    lbTitle: { color: '#D4AF37', textAlign: 'center', marginBottom: 15, fontSize: 14, fontWeight: 'bold' },
    lbRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#151515' },
    lbRank: { color: '#666', width: 30 },
    lbName: { color: '#fff', flex: 1, fontWeight: 'bold' },
    lbXp: { color: '#D4AF37' },
    factionPicker: { flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between' },
    fBtn: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#333' },
    fBtnHorde: { borderBottomColor: '#8b0000', backgroundColor: '#2a0000' },
    fBtnAlliance: { borderBottomColor: '#1e90ff', backgroundColor: '#001a33' },
    fBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});