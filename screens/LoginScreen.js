import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [dealer, setDealer] = useState('Sri Lakshmi Gas Agency');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || !dealer || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your phone number, choose gas type, and enter your password.');
      return;
    }

    try {
      const savedUserData = await AsyncStorage.getItem('registeredUser');
      const savedUser = savedUserData ? JSON.parse(savedUserData) : null;

      if (!savedUser) {
        Alert.alert('No account found', 'Please sign up first.');
        navigation.replace('Register');
        return;
      }

      const typedPhone = phone.trim();
      const typedPassword = password.trim();
      const validPhone = savedUser.phone === typedPhone;
      const validDealer = savedUser.dealer === dealer;
      const validPassword = savedUser.password === typedPassword;

      if (!validPhone || !validDealer || !validPassword) {
        Alert.alert('Login failed', 'The phone number, gas type, or password does not match your account.');
        return;
      }

      await AsyncStorage.setItem('user', JSON.stringify(savedUser));
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Unable to log in right now.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>GasAlert</Text>
        <Text style={styles.subheading}>Login to your account</Text>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor="#8d99a6"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#8d99a6"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Choose Gas Type</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={dealer}
            onValueChange={setDealer}
            style={styles.picker}
            dropdownIconColor="#2d6a4f"
          >
            <Picker.Item label="HP Gas" value="Sri Lakshmi Gas Agency" />
            <Picker.Item label="Bharat Gas" value="Bharat Gas Centre" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Register')}>
          <Text style={styles.link}>Need an account? Sign up here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3f7f2',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a3a2a',
    marginBottom: 8,
  },
  subheading: {
    textAlign: 'center',
    color: '#6f7d75',
    marginBottom: 24,
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    color: '#415046',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8dfd8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2933',
    marginBottom: 14,
    backgroundColor: '#fbfcfb',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#d8dfd8',
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: '#fbfcfb',
  },
  picker: {
    color: '#1f2933',
  },
  button: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    marginTop: 16,
    color: '#2d6a4f',
    fontSize: 14,
    fontWeight: '600',
  },
});
