import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

const GradientWrapper = ({ children, style }) => {
  try {
    return (
      <LinearGradient colors={['#4C51BF', '#6B46C1']} style={style}>
        {children}
      </LinearGradient>
    );
  } catch (e) {
    return (
      <View style={[style, { backgroundColor: '#4C51BF' }]}>
        {children}
      </View>
    );
  }
};

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading: isLoading } = useContext(AppContext);

  const handleRegister = async () => {
    if (isLoading) return;
    if (!name || !email || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields to register.');
      return;
    }

    const { success } = await register(name, email, password, name);

    if (success) {
      // On successful registration, navigate back to the Login screen.
      // This allows the user to log in normally and prevents navigation conflicts.
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
                <Ionicons name="person-add-outline" size={60} color="#4C51BF" />
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join and start managing your classes.</Text>
            </View>
        </View>

        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#A0AEC0"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />
            </View>

            <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#A0AEC0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#A0AEC0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                <GradientWrapper style={styles.buttonGradient}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
                </GradientWrapper>
            </TouchableOpacity>
        </View>

        <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
        >
            <Text style={styles.link}>
                Already have an account?{' '}
                <Text style={styles.linkBold}>Login</Text>
            </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  container: { flex: 1, paddingHorizontal: 0, justifyContent: 'center' },
  headerContainer: {
    backgroundColor: '#F2F4FF',
    paddingTop: 50,
    paddingBottom: 35,
    marginBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#4C51BF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: { alignItems: 'center', paddingHorizontal: 30 },
  title: { fontSize: 34, fontWeight: '800', marginTop: 15, marginBottom: 5, color: '#4C51BF' },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center', maxWidth: 300 },
  formContainer: { paddingHorizontal: 30, width: '100%', marginBottom: 30 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#4C51BF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: { paddingHorizontal: 15 },
  input: { flex: 1, height: 55, paddingRight: 15, fontSize: 16, color: '#2D3748' },
  button: { width: '100%', borderRadius: 12, marginTop: 10, overflow: 'hidden' },
  buttonGradient: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  loginLinkContainer: { alignItems: 'center', marginTop: 20 },
  link: { fontSize: 15, color: '#718096' },
  linkBold: { color: '#4C51BF', fontWeight: '700' },
});

