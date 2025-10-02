import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import ClassCard from '../components/ClassCard';

export default function ClassesScreen({ navigation }) {
  const { classes } = useContext(AppContext);

  const renderItem = ({ item }) => <ClassCard classItem={item} onPress={() => navigation.navigate('ClassDetail', { classId: item.id })} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classes</Text>
      <FlatList data={classes} renderItem={renderItem} keyExtractor={item => item.id.toString()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#007AFF' },
});