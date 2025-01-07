import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Vibration } from 'react-native';

const Timeline = () => {
  const [gols, setGols] = useState([]);

  useEffect(() => {
    // Simulação de recebimento de gols em tempo real
    const interval = setInterval(() => {
      setGols(prevGols => [
        ...prevGols,
        {
          id: `${prevGols.length}`,
          hora: new Date().toLocaleTimeString(),
          campeonato: 'Campeonato X',
          times: 'Time A vs Time B',
          placar: '1-0',
          tempo: '45\'',
          dica: "Possibilidade de gol nos proximos minutos"
        }
      ]);
      Vibration.vibrate();
    }, 5000); // Atualiza a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const renderGol = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.time}>{item.hora}</Text>
      <Text>{item.campeonato}</Text>
      <Text>{item.times}</Text>
      <Text>{item.placar}</Text>
      <Text>{item.tempo}</Text>
      <Text>{item.dica}</Text>
    </View>
  );

  return (
    <FlatList
      data={gols}
      renderItem={renderGol}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  time: {
    fontWeight: 'bold',
  },
});

export default Timeline;
