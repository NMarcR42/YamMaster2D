import React from 'react';
import { Image, StyleSheet } from 'react-native';

const RankIcon = ({ faction, rank = 1 }) => {
    // Définition des images selon la faction et le rank (1 à 4)
    // Assure-toi d'avoir créé le dossierassets/ranks/ et d'y avoir mis les fichiers découpés.
    const icons = {
        horde: {
            1: require('../../../assets/ranks/horde_rank1.png'), 
            2: require('../../../assets/ranks/horde_rank2.png'), 
            3: require('../../../assets/ranks/horde_rank3.png'), 
            4: require('../../../assets/ranks/horde_rank4.png'), 
        },
        alliance: {
            1: require('../../../assets/ranks/alliance_rank1.png'), 
            2: require('../../../assets/ranks/alliance_rank2.png'), 
            3: require('../../../assets/ranks/alliance_rank3.png'), 
            4: require('../../../assets/ranks/alliance_rank4.png'), 
        }
    };

    // Sécurité : Faction par défaut si non reconnue
    const selectedFaction = icons[faction] ? faction : 'horde';
    // Sécurité : Rank 1 si hors limites
    const selectedRank = (rank >= 1 && rank <= 4) ? rank : 1;

    return (
        <Image 
            source={icons[selectedFaction][selectedRank]} 
            style={styles.icon} 
            resizeMode="contain"
        />
    );
};

const styles = StyleSheet.create({
    icon: {
        width: 28, // Ajuste la taille selon ton header
        height: 28,
        marginRight: 8, // Espace avant le pseudo
    },
});

export default RankIcon;