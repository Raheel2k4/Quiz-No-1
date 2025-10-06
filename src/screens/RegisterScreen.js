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
// Assuming expo and vector icons are available
import { LinearGradient } from 'expo-linear-gradient'; 
import { Ionicons } from '@expo/vector-icons'; 
import { AppContext } from '../context/AppContext';

// Fallback component for LinearGradient if expo is not available
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


export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState(''); // State for the new Full Name field
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Destructure 'loading' state
  const { register, loading: isLoading } = useContext(AppContext); 

  const handleRegister = async () => {
    // Prevent interaction if loading
    if (isLoading) return; 

    // Basic validation
    if (!name || !email || !password) {
      Alert.alert('Missing Information', 'Please fill in your name, email, and password to register.');
      return;
    }

    // Call the context function to register and log in the user
    const success = await register(name, email, password); 
    
    if (success) {
      // If registration and subsequent login are successful, navigate.
      navigation.replace('Main');
    } else {
      // Fallback alert (AppContext typically handles specific Firebase/API errors)
      Alert.alert('Registration Failed', 'An error occurred during registration. Please check your details or try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* UPDATED HEADER STRUCTURE AND COLOR */}
        <View style={styles.headerContainer}> 
            <View style={styles.headerContent}>
                <Ionicons name="person-add-outline" size={60} color="#4C51BF" />
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join us and start managing your classes immediately.</Text>
            </View>
        </View>
        
        <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#A0AEC0"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    textContentType="name"
                />
            </View>
            
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
                    textContentType="newPassword"
                />
            </View>

            {/* Register Button (Uses the gradient) */}
            <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister} 
                disabled={isLoading}
                activeOpacity={0.8}
            >
                <GradientWrapper style={styles.buttonGradient}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </GradientWrapper>
            </TouchableOpacity>
        </View>

        {/* Login Link */}
        <TouchableOpacity 
            style={styles.loginLinkContainer} 
            onPress={() => navigation.goBack()}
            disabled={isLoading}
        >
            <Text style={styles.link}>
                <Text>Already have an account? </Text>
                {/* The link is also styled with the brand color: #4C51BF */}
                <Text style={styles.linkBold}>Login</Text>
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
    // Removed padding horizontal here to allow headerContainer to be full width
    paddingHorizontal: 0, 
    justifyContent: 'flex-start', // Align to top
  },
  
  // NEW STYLES FOR THE HEADER STRUCTURE AND COLOR SCHEME
  headerContainer: {
    backgroundColor: '#F2F4FF', // Light purple hue for the distinct header background
    paddingTop: 50, // More top padding
    paddingBottom: 35, // More bottom padding to give space
    marginBottom: 40, // Space between header block and form
    borderBottomLeftRadius: 30, // Large border radius for the curve
    borderBottomRightRadius: 30, // Large border radius for the curve
    // Subtle shadow to lift the header block
    shadowColor: '#4C51BF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 30, // Horizontal padding for content inside the header
  },
  // END NEW HEADER STYLES
  
  title: {
    fontSize: 34,
    fontWeight: '800', // Extra bold title
    marginTop: 15,
    marginBottom: 5,
    color: '#4C51BF', // Primary purple color
  },
  subtitle: {
    fontSize: 16,
    color: '#718096', // Subtle grey for body text
    textAlign: 'center',
    maxWidth: 300,
  },
  formContainer: {
    // Added padding horizontal here since it was removed from container
    paddingHorizontal: 30, 
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
  loginLinkContainer: {
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
