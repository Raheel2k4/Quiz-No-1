import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { AppContext } from '../context/AppContext';
import ClassCard from '../components/ClassCard';
import Header from '../components/Header';

export default function ClassesScreen({ navigation }) {
  const { classes } = useContext(AppContext);

  const renderItem = ({ item }) => (
    <ClassCard 
      classItem={item} 
      onPress={() => navigation.navigate('ClassDetail', { classId: item.id })} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="All Classes" navigation={navigation} />
      <FlatList 
        data={classes} 
        renderItem={renderItem} 
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No classes to display.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F9FC'
  },
  listContent: { 
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#64748B',
  },
});