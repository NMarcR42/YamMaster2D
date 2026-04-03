import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import PlayerTimer from "./timers/player-timer.component";
import OpponentTimer from "./timers/opponent-timer.component";
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import Choices from './choices/choices.component';
import Grid from './grid/grid.component';
import RankIcon from "../visuals/rank-icon.component";

const Board = ({ 
  username, userFaction, userPions, userScore,
  opponentName, opponentFaction, opponentPions, opponentScore,
  factionColor 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header - Info Adversaire */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <RankIcon faction={opponentFaction} rank={1} />
          <View>
            <Text style={styles.opponentName}>{opponentName || "ADVERSAIRE"}</Text>
            <Text style={styles.miniScore}>Pions: {opponentPions} | Score: {opponentScore}</Text>
          </View>
        </View>
        <OpponentTimer />
      </View>

      {/* Table de jeu (Tapis vert) */}
      <View style={styles.feltTable}>
        <View style={styles.opponentArea}>
          <OpponentDeck />
        </View>

        <View style={styles.centerRow}>
          <View style={styles.gridContainer}>
            <Grid factionColor={factionColor} />
          </View>
          <View style={styles.sideBar}>
            <Choices factionColor={factionColor} />
          </View>
        </View>

        <View style={styles.playerArea}>
          <PlayerDeck factionColor={factionColor} />
        </View>
      </View>

      {/* Footer - Info Joueur */}
      <View style={[styles.bottomBar, { borderTopColor: factionColor }]}>
        <View style={styles.userInfo}>
          <RankIcon faction={userFaction} rank={1} />
          <View>
            <Text style={[styles.playerName, { color: factionColor }]}>{username.toUpperCase()}</Text>
            <Text style={styles.miniScore}>Pions: {userPions} | Score: {userScore}</Text>
          </View>
        </View>
        <PlayerTimer factionColor={factionColor} />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  bottomBar: { height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderTopWidth: 3 },
  userInfo: { flexDirection: 'row', alignItems: 'center' }, 
  feltTable: { flex: 1, backgroundColor: '#065535', margin: 10, borderRadius: 25, padding: 15, borderWidth: 2, borderColor: '#0a7d4e' },
  opponentArea: { height: 50, justifyContent: 'center', opacity: 0.7 },
  playerArea: { height: 120, justifyContent: 'center' },
  centerRow: { flex: 1, flexDirection: 'row', marginVertical: 10 },
  gridContainer: { flex: 2, borderWidth: 2, borderColor: '#D4AF37', borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.1)' },
  sideBar: { flex: 1, marginLeft: 15, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 5 },
  opponentName: { color: '#aaa', fontWeight: 'bold' },
  playerName: { fontWeight: 'bold', letterSpacing: 1 },
  scoreText: { color: '#FFF', fontWeight: 'bold' },
  miniScore: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});

export default Board;