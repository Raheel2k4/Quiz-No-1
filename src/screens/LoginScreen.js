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
import { LinearGradient } from 'expo-linear-gradient'; // Assuming expo is available for LinearGradient
import { Ionicons } from '@expo/vector-icons'; // For input icons
import { AppContext } from '../context/AppContext';

// Fallback component for LinearGradient if expo is not available
// This is often needed in some React Native environments.
const GradientWrapper = ({ children, style }) => {
  try {
    // Attempt to render the expo component
    return (
      <LinearGradient
        colors={['#4C51BF', '#6B46C1']} // Deep Purple to Indigo gradient
        style={style}
      >
        {children}
      </LinearGradient>
    );
  } catch (e) {
    // Fallback to a plain View with a solid color if LinearGradient fails
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
  // Assuming the context uses 'loading' based on AppContext.js
  const { login, loading: isLoading } = useContext(AppContext); 

  const handleLogin = async () => {
    if (isLoading) return;

    // 1. Check for basic input before calling the login API
    if (!email || !password) {
        Alert.alert('Missing Details', 'Please enter both email and password.');
        return;
    }

    // ** THE CRITICAL FIX: Use await to wait for the boolean result from the async function **
    const success = await login(email, password); 

    if (success) {
      // Only navigate if the login was successful and the user state was set
      navigation.replace('Main');
    } 
    // The 'login' function already shows an Alert on failure, so no need for an extra else block here.
    // If it fails, execution simply stops.
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
            <Text style={styles.subtitle}>Sign in to manage your classes and attendance.</Text>
        </View>

        <View style={styles.formContainer}>
            {/* Email Input */}
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
                    textContentType="emailAddress"
                />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#A0AEC0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textContentType="password"
                />
            </View>

            {/* Login Button */}
            <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin} 
                disabled={isLoading}
                activeOpacity={0.8}
            >
                <GradientWrapper style={styles.buttonGradient}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        // FIX: Ensure 'Log In' is wrapped in Text
                        <Text style={styles.buttonText}>Log In</Text>
                    )}
                </GradientWrapper>
            </TouchableOpacity>
        </View>

        {/* Register Link */}
        <TouchableOpacity 
            style={styles.registerLinkContainer} 
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
        >
            {/* FIX: Ensure all surrounding and static text is wrapped in Text */}
            <Text style={styles.link}>
                <Text>Don't have an account? </Text>
                <Text style={styles.linkBold}>Register</Text>
            </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC', // Very light background
  },
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800', // Extra bold title
    marginTop: 15,
    marginBottom: 5,
    color: '#1A202C', // Dark text for contrast
  },
  subtitle: {
    fontSize: 16,
    color: '#718096', // Subtle grey for body text
    textAlign: 'center',
    maxWidth: 300,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
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
  inputIcon: {
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 55,
    paddingRight: 15,
    fontSize: 16,
    color: '#2D3748',
  },
  button: {
    width: '100%',
    borderRadius: 12,
    marginTop: 10,
    overflow: 'hidden', // Ensures gradient respects border radius
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  registerLinkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  link: {
    fontSize: 15,
    color: '#718096',
  },
  linkBold: {
    color: '#4C51BF',
    fontWeight: '700',
  },
});
