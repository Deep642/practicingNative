import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/icon.png')} // Replace with your logo path
        style={styles.logo}
      />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
});
