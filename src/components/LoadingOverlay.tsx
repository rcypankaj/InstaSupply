import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface Props {
  message?: string;
}

export function LoadingOverlay({ message }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1A73E8" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
