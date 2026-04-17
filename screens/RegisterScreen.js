import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEALERS = [
  { label: 'HP Gas', brand: 'HP Gas' },
  { label: 'Bharat Gas', brand: 'Bharat Gas' },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [dealer, setDealer] = useState(DEALERS[0].brand);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim() || !dealer) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.trim().length < 4) {
      Alert.alert('Error', 'Password should be at least 4 characters.');
      return;
    }

    const selectedDealer = DEALERS.find(item => item.brand === dealer);
    const user = {
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim(),
      dealer,
      gasType: selectedDealer?.brand || '',
    };

    try {
      await AsyncStorage.setItem('registeredUser', JSON.stringify(user));
      Alert.alert('Success', 'Account created! Please login.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Could not save your account right now.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>GasAlert</Text>
        <Text style={styles.subheading}>Create your account</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#8d99a6"
          value={name}
          onChangeText={setName}
        />

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
          placeholder="Create a password"
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
            {DEALERS.map(item => (
              <Picker.Item key={item.brand} label={item.label} value={item.brand} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.link}>Already registered? Login here</Text>
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
    backgroundColor: '#fff',
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
    marginBottom: 8,
    color: '#1a3a2a',
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
    marginBottom: 18,
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
