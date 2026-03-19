import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1A73E8' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        headerShown: false
      }}
    />
  );
}
