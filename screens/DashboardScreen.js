import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {

  const [userName,   setUserName]   = useState('');
  const [daysSince,  setDaysSince]  = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [subsidy,    setSubsidy]    = useState(0);
  const [weather,    setWeather]    = useState('Fetching weather...');
  const [weatherError, setWeatherError] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('No active booking');
  const [latestBooking, setLatestBooking] = useState(null);
  const [loading,    setLoading]    = useState(true);

  // Booking modal state
  const [showModal,  setShowModal]  = useState(false);
  const [emptyDate,  setEmptyDate]  = useState('');
  const [slot,       setSlot]       = useState('');

  useEffect(() => {
    loadUser();
    loadDashboard();
    fetchWeather();
  }, []);

  // Reload when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadDashboard);
    return unsubscribe;
  }, [navigation]);

  // Load user name from AsyncStorage
  const loadUser = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const user = JSON.parse(data);
      setUserName(user.name);
    }
  };

  // Load bookings from AsyncStorage and calculate stats
  const loadDashboard = async () => {
    const data = await AsyncStorage.getItem('bookings');
    const bookings = data ? JSON.parse(data) : [];

    if (bookings.length === 0) {
      setSuggestion('No bookings yet. Book your first cylinder!');
      setSubsidy(0);
      setDaysSince(0);
      setBookingStatus('No active booking');
      setLatestBooking(null);
      setLoading(false);
      return;
    }

    // Get last booking date
    const last = bookings[bookings.length - 1];
    setLatestBooking(last);
    const since = getDaysSince(last.emptyDate || last.bookingDate);
    setDaysSince(since);
    setBookingStatus(last.status === 'pending' ? 'Pending delivery' : 'Delivered');

    // Average days a cylinder lasts
    const avg = getAverage(bookings);
    const daysLeft = Math.max(0, avg - since);

    // Smart suggestion
    if (daysLeft < 10 && daysLeft > 0) {
      const lowMsg = 'Only ~' + daysLeft + ' days of gas left.';
      setSuggestion(last.status === 'pending' ? 'Order placed successfully. ' + lowMsg : 'Book soon! ' + lowMsg);
      // Alert = Broadcasting equivalent
      Alert.alert('Low Gas Alert!', 'Only ~' + daysLeft + ' days remaining. Book now!');
    } else if (daysLeft === 0) {
      setSuggestion(last.status === 'pending'
        ? 'Order placed successfully. You may have already run out of gas.'
        : 'You may have run out! Book a cylinder now.');
    } else {
      setSuggestion(last.status === 'pending'
        ? 'Order placed successfully. Estimated ~' + daysLeft + ' days of gas left.'
        : "You're good! ~" + daysLeft + ' days of gas left.');
    }

    // Subsidy tracker - 12 cylinders per year
    setSubsidy(Math.min(bookings.length, 12));
    setLoading(false);
  };

  // Fetch weather using Networking API (fetch)
  const fetchWeather = async () => {
    try {
      const res  = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=12.71&longitude=77.69&current_weather=true'
      );
      if (!res.ok) {
        throw new Error('Weather request failed');
      }
      const data = await res.json();
      const temp = Math.round(data.current_weather.temperature);
      setWeatherError(false);

      if (temp <= 20) {
        setWeather("It's " + temp + ' degrees C - colder weather may increase gas usage.');
      } else if (temp >= 35) {
        setWeather("It's " + temp + ' degrees C - hotter weather may help gas last longer.');
      } else {
        setWeather('Temperature: ' + temp + ' degrees C - normal usage.');
      }
    } catch (error) {
      setWeatherError(true);
      setWeather('Weather unavailable right now.');
    }
  };

  // Save booking to AsyncStorage
  const handleBookPress = async () => {
    const data = await AsyncStorage.getItem('bookings');
    const bookings = data ? JSON.parse(data) : [];

    if (bookings.length > 0) {
      const last = bookings[bookings.length - 1];
      if (last.status === 'pending') {
        Alert.alert(
          'Booking Already Active',
          'You already have a cylinder booked! Wait until it is delivered before booking again.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setShowModal(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadDashboard();
    await fetchWeather();
  };

  const markAsDelivered = async () => {
    const data = await AsyncStorage.getItem('bookings');
    const bookings = data ? JSON.parse(data) : [];

    if (!bookings.length) {
      Alert.alert('No Booking', 'There is no booking to mark as delivered.');
      return;
    }

    const lastIndex = bookings.length - 1;
    if (bookings[lastIndex].status !== 'pending') {
      Alert.alert('Already Delivered', 'Your latest booking is already marked as delivered.');
      return;
    }

    bookings[lastIndex] = { ...bookings[lastIndex], status: 'delivered' };
    await AsyncStorage.setItem('bookings', JSON.stringify(bookings));
    Alert.alert('Updated', 'Your latest booking has been marked as delivered.');
    loadDashboard();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to sign out and go back to Login?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        },
      },
    ]);
  };

  // Save booking to AsyncStorage
  const bookCylinder = async () => {
    if (!emptyDate) {
      Alert.alert('Error', 'Please enter when your last cylinder got empty');
      return;
    }
    const parsedEmptyDate = parseDate(emptyDate);
    if (!parsedEmptyDate) {
      Alert.alert('Error', 'Please enter a valid date in dd/MM/yyyy format');
      return;
    }
    if (parsedEmptyDate.getTime() > new Date().getTime()) {
      Alert.alert('Error', 'Future dates are not allowed for an empty cylinder date');
      return;
    }
    if (!slot) {
      Alert.alert('Error', 'Please select a delivery slot');
      return;
    }

    const data     = await AsyncStorage.getItem('bookings');
    const bookings = data ? JSON.parse(data) : [];

    const today    = getToday();
    const days     = getDaysSince(emptyDate);

    bookings.push({ bookingDate: today, emptyDate, days, slot, status: 'pending' });
    await AsyncStorage.setItem('bookings', JSON.stringify(bookings));

    setShowModal(false);
    setEmptyDate('');
    setSlot('');
    Alert.alert('Order Placed', 'Order placed successfully for ' + today + '.');
    loadDashboard();
  };

  // Helper: today as dd/MM/yyyy
  const getToday = () => {
    const d  = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '/' + mm + '/' + d.getFullYear();
  };

  // Helper: parse dd/MM/yyyy safely
  const parseDate = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;

    const parsed = new Date(yyyy, mm - 1, dd);
    const isValid =
      parsed.getFullYear() === yyyy &&
      parsed.getMonth() === mm - 1 &&
      parsed.getDate() === dd;

    return isValid ? parsed : null;
  };

  // Helper: how many days since a dd/MM/yyyy date
  const getDaysSince = (dateStr) => {
    const past = parseDate(dateStr);
    if (!past) return 0;
    return Math.floor((Date.now() - past.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Helper: average days per cylinder
  const getAverage = (bookings) => {
    const valid = bookings.filter(b => b.days > 0);
    if (!valid.length) return 30;
    const sum = valid.reduce((total, b) => total + b.days, 0);
    return Math.round(sum / valid.length);
  };

  const slots = ['Morning (9am - 12pm)', 'Afternoon (12pm - 4pm)', 'Evening (4pm - 8pm)'];

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2d6a4f" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.logo}>Hello, {userName}!</Text>
          <TouchableOpacity style={styles.headerLogout} onPress={handleLogout}>
            <Text style={styles.headerLogoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>GasAlert Lite</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>

        {/* Weather Card - Networking API */}
        <View style={styles.blueCard}>
          <Text style={styles.blueCardText}>{weather}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Days since empty date</Text>
            <Text style={styles.statValue}>{daysSince}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Cylinders this year</Text>
            <Text style={styles.statValue}>{subsidy}/12</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current booking status</Text>
          <Text style={styles.statusValue}>{bookingStatus}</Text>
        </View>

        {/* Suggestion */}
        <View style={styles.greenCard}>
          <Text style={styles.greenCardText}>{suggestion}</Text>
        </View>

        <View style={styles.bookingCard}>
          <View style={styles.bookingCardHeader}>
            <Text style={styles.bookingCardTitle}>Active Booking</Text>
            <Text style={styles.bookingBadge}>
              {latestBooking?.status === 'pending' ? 'Pending' : 'Delivered'}
            </Text>
          </View>
          <Text style={styles.bookingDetail}>
            Booked on: {latestBooking?.bookingDate || 'No booking yet'}
          </Text>
          <Text style={styles.bookingDetail}>
            Empty since: {latestBooking?.emptyDate || '-'}
          </Text>
          <Text style={styles.bookingDetail}>
            Slot: {latestBooking?.slot || '-'}
          </Text>
        </View>

        <TouchableOpacity style={styles.outlineButton} onPress={markAsDelivered}>
          <Text style={styles.outlineButtonText}>Mark Latest Booking Delivered</Text>
        </TouchableOpacity>

        {weatherError && (
          <TouchableOpacity style={styles.outlineButton} onPress={handleRefresh}>
            <Text style={styles.outlineButtonText}>Refresh Dashboard</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={[styles.navIcon, styles.navIconActive]}>⌂</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleBookPress}>
          <Text style={styles.navIcon}>+</Text>
          <Text style={styles.navLabel}>Book</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dealers')}>
          <Text style={styles.navIcon}>⌖</Text>
          <Text style={styles.navLabel}>Dealers</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Book a Cylinder</Text>

            <Text style={styles.label}>When did your last cylinder get empty? (dd/MM/yyyy)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 01/03/2026"
              value={emptyDate}
              onChangeText={setEmptyDate}
            />

            <Text style={styles.label}>Select Delivery Slot</Text>
            {slots.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.slotOption, slot === s && styles.slotSelected]}
                onPress={() => setSlot(s)}
              >
                <Text style={styles.slotText}>{s}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.button} onPress={bookCylinder}>
              <Text style={styles.buttonText}>Confirm Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineButton} onPress={() => setShowModal(false)}>
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f2f2f2' },
  loader:            { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:            { backgroundColor: '#1a3a2a', padding: 20, paddingTop: 50 },
  headerTopRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLogout:      { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: '#f08080' },
  headerLogoutText:  { color: '#f08080', fontSize: 12, fontWeight: '600' },
  logo:              { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub:         { color: '#9ecfb4', fontSize: 13, marginTop: 2 },
  body:              { padding: 16, paddingBottom: 110 },
  blueCard:          { backgroundColor: '#e6f1fb', borderRadius: 8, padding: 14, marginBottom: 12 },
  blueCardText:      { color: '#185fa5', fontSize: 14 },
  statsRow:          { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox:           { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 14 },
  statLabel:         { fontSize: 12, color: '#888', marginBottom: 4 },
  statValue:         { fontSize: 26, fontWeight: 'bold', color: '#1a3a2a' },
  statusCard:        { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 12 },
  statusLabel:       { fontSize: 12, color: '#888', marginBottom: 4 },
  statusValue:       { fontSize: 16, fontWeight: 'bold', color: '#1a3a2a' },
  greenCard:         { backgroundColor: '#d8f3dc', borderRadius: 8, padding: 14, marginBottom: 16 },
  greenCardText:     { color: '#1b4332', fontSize: 14 },
  bookingCard:       { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 12 },
  bookingCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bookingCardTitle:  { fontSize: 16, fontWeight: 'bold', color: '#1a3a2a' },
  bookingBadge:      { color: '#2d6a4f', fontSize: 12, fontWeight: 'bold', backgroundColor: '#eef8f1', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  bookingDetail:     { fontSize: 13, color: '#4a4a4a', marginBottom: 6 },
  button:            { backgroundColor: '#2d6a4f', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText:        { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  outlineButton:     { borderWidth: 1, borderColor: '#2d6a4f', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  outlineButtonText: { color: '#2d6a4f', fontWeight: 'bold', fontSize: 15 },
  bottomNav:         { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 8, elevation: 8 },
  navItem:           { alignItems: 'center', justifyContent: 'center', minWidth: 72 },
  navIcon:           { fontSize: 22, lineHeight: 24, color: '#6c757d' },
  navIconActive:     { color: '#2d6a4f' },
  navLabel:          { marginTop: 4, fontSize: 11, color: '#6c757d', fontWeight: '600' },
  navLabelActive:    { color: '#2d6a4f' },
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:          { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:        { fontSize: 20, fontWeight: 'bold', color: '#1a3a2a', marginBottom: 16 },
  label:             { fontSize: 13, color: '#444', marginBottom: 6, marginTop: 8 },
  input:             { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8, fontSize: 14 },
  slotOption:        { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  slotSelected:      { borderColor: '#2d6a4f', backgroundColor: '#f0faf4' },
  slotText:          { fontSize: 14, color: '#333' },
});
