import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import ClassCard from '../components/ClassCard';

export default function DashboardScreen({ navigation }) {
  const { classes, addClass } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a valid class name.');
      return;
    }

    setLoading(true);
    const success = await addClass(newClassName.trim());
    setLoading(false);

    if (success) {
      setNewClassName('');
      setModalVisible(false);
    }
    // Note: addClass handles its own error alerts
  };

  const renderItem = ({ item }) => (
    <ClassCard 
      classItem={item} 
      onPress={() => navigation.navigate('ClassDetail', { classId: item.id })} 
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Total Classes: {classes.length}</Text>
      <FlatList
        data={classes}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Class</Text>
      </TouchableOpacity>

      {/* Add Class Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>Add New Class</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="e.g., Algebra 101"
              value={newClassName}
              onChangeText={setNewClassName}
              editable={!loading}
            />
            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.buttonClose]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={modalStyles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.buttonAdd]}
                onPress={handleAddClass}
                disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={modalStyles.textStyle}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
  subtitle: { fontSize: 16, marginBottom: 20, color: 'gray' },
  list: { flex: 1 },
  addButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333'
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        marginBottom: 20,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 8,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: '#95a5a6',
    },
    buttonAdd: {
        backgroundColor: '#007AFF',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});
