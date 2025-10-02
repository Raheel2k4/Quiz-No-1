import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({ title, onRightPress, rightText = 'Logout' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onRightPress && (
        <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
          <Text style={styles.rightButtonText}>{rightText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  rightButton: {
    padding: 8,
  },
  rightButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});