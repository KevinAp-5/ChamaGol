import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

export default function Title({ title }: { title: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.titleContainer, { backgroundColor: colors.primary }]}>
      <Text style={[styles.titleText, { color: colors.background }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'sans-serif'
  },
});