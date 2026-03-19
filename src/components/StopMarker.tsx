import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { LatLng } from '../types/route';

interface Props {
  coordinate: LatLng;
  stopNumber: number;
  isCompleted?: boolean;
  label?: string;
  onPress?: () => void;
}

export function StopMarker({ coordinate, stopNumber, isCompleted, label, onPress }: Props) {
  return (
    <Marker coordinate={coordinate} onPress={onPress} title={label}>
      <View style={[styles.pin, isCompleted && styles.pinCompleted]}>
        <Text style={styles.number}>{stopNumber}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinCompleted: {
    backgroundColor: '#10B981',
  },
  number: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
