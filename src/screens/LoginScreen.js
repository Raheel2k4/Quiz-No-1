import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading: isLoading } = useContext(AppContext);

  const handleLogin = async () => {
    if (isLoading) return;
    if (!email || !password) {
        Alert.alert('Missing Details', 'Please enter both email and password.');
        return;
    }

    // FIX: Removed manual navigation.
    // The AppNavigator will now automatically handle the screen change when the 'user' state is updated.
    await login(email, password);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
            <Ionicons name="school-outline" size={60} color="#4C51BF" />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to manage your classes.</Text>
        </View>

        <View style={styles.formContainer}>
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
                onPress={handleLogin} 
                disabled={isLoading}
                activeOpacity={0.8}
            >
                <GradientWrapper style={styles.buttonGradient}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
                </GradientWrapper>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
            style={styles.registerLinkContainer} 
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
        >
            <Text style={styles.link}>
                Don't have an account?{' '}
                <Text style={styles.linkBold}>Register</Text>
            </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 34, fontWeight: '800', marginTop: 15, marginBottom: 5, color: '#1A202C' },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center', maxWidth: 300 },
  formContainer: { width: '100%', marginBottom: 30 },
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
  registerLinkContainer: { alignItems: 'center', marginTop: 20 },
  link: { fontSize: 15, color: '#718096' },
  linkBold: { color: '#4C51BF', fontWeight: '700' },
});

