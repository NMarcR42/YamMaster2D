// board.component

import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import PlayerTimer from "./timers/player-timer.component";
import OpponentTimer from "./timers/opponent-timer.component";
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import Choices from './choices/choices.component';
import Grid from './grid/grid.component';
import RankIcon from "../visuals/rank-icon.component";

const Board = (props) => {
  // On extrait les données brutes envoyées par le serveur
  const { 
    player1Name, player1Faction, player1Pions, player1Score,
    player2Name, player2Faction, player2Pions, player2Score,
    factionColor, yourPlayerKey 
  } = props;

  // LOGIQUE DE MAPPING : On définit qui est l'utilisateur et qui est l'adversaire
  const isPlayer1 = yourPlayerKey === 'player:1';

  const username = isPlayer1 ? player1Name : player2Name;
  const userFaction = isPlayer1 ? player1Faction : player2Faction;
  const userPions = isPlayer1 ? player1Pions : player2Pions;
  const userScore = isPlayer1 ? player1Score : player2Score;

  const opponentName = isPlayer1 ? player2Name : player1Name;
  const opponentFaction = isPlayer1 ? player2Faction : player1Faction;
  const opponentPions = isPlayer1 ? player2Pions : player1Pions;
  const opponentScore = isPlayer1 ? player2Score : player1Score;

  // Sécurité pour éviter le crash .toUpperCase()
  const displayUsername = (username || "JOUEUR").toUpperCase();
  const displayOpponentName = (opponentName || "ADVERSAIRE").toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: 40 }]}>    
      {/* Header - Info Adversaire */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <RankIcon faction={opponentFaction} rank={1} />
          <View>
            <Text style={styles.opponentName}>{displayOpponentName}</Text>
            <Text style={styles.miniScore}>Pions: {String(opponentPions || 0)} | Score: {String(opponentScore || 0)}</Text>
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
      <View style={[styles.bottomBar, { borderTopColor: factionColor || '#D4AF37' }]}>
        <View style={styles.userInfo}>
          <RankIcon faction={userFaction} rank={1} />
          <View>
            <Text style={[styles.playerName, { color: factionColor || '#FFF' }]}>{displayUsername}</Text>
            <Text style={styles.miniScore}>Pions: {String(userPions || 0)} | Score: {String(userScore || 0)}</Text>
          </View>
        </View>
        <PlayerTimer factionColor={factionColor} />
      </View>

    </View>
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
  miniScore: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});

export default Board;