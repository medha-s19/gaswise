import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';

export default function DealersScreen({ navigation }) {

  // Hardcoded dealers near Anekal
  const dealers = [
    { id: '1', name: 'Sri Lakshmi Gas Agency', address: 'Main Road, Anekal',     distance: '1.2 km', stock: 'In Stock',    brand: 'HP Gas',     phone: '9845012345' },
    { id: '2', name: 'Bharat Gas Centre',      address: 'Bus Stand, Anekal',     distance: '2.4 km', stock: 'Low Stock',   brand: 'Bharat Gas', phone: '9845023456' },
    { id: '3', name: 'Indane Distributor',     address: 'Market Street, Anekal', distance: '3.1 km', stock: 'Out of Stock',brand: 'Indane',     phone: '9845034567' },
    { id: '4', name: 'Sai Gas Agency',         address: 'Sarjapura Road',        distance: '4.0 km', stock: 'In Stock',    brand: 'HP Gas',     phone: '9845045678' },
  ];

  const callDealer = (phone, name) => {
    Alert.alert('Call ' + name, 'Do you want to call this dealer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL('tel:' + phone) },
    ]);
  };

  const getBadgeStyle = (stock) => {
    if (stock === 'In Stock') return { bg: '#d8f3dc', color: '#1b4332' };
    if (stock === 'Low Stock') return { bg: '#fff3cd', color: '#856404' };
    return { bg: '#f8d7da', color: '#721c24' };
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logo}>Nearby Dealers</Text>
        <Text style={styles.headerSub}>Anekal, Bangalore</Text>
      </View>

      <FlatList
        data={dealers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const badge = getBadgeStyle(item.stock);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.dealerName}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{item.stock}</Text>
                </View>
              </View>

              <Text style={styles.address}>{item.address}</Text>

              <View style={styles.cardBottom}>
                <Text style={styles.distance}>{item.distance}</Text>
                <Text style={styles.brand}>{item.brand}</Text>
              </View>

              <TouchableOpacity
                style={styles.callButton}
                onPress={() => callDealer(item.phone, item.name)}
              >
                <Text style={styles.callButtonText}>Call Dealer</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.navIcon}>+</Text>
          <Text style={styles.navLabel}>Book</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dealers')}>
          <Text style={[styles.navIcon, styles.navIconActive]}>⌖</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Dealers</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f2f2f2' },
  header:         { backgroundColor: '#1a3a2a', padding: 20, paddingTop: 50 },
  logo:           { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub:      { color: '#9ecfb4', fontSize: 13, marginTop: 2 },
  listContent:    { padding: 14, paddingBottom: 110 },
  card:           { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  dealerName:     { fontSize: 15, fontWeight: 'bold', color: '#1a3a2a', flex: 1 },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:      { fontSize: 11, fontWeight: 'bold' },
  address:        { fontSize: 13, color: '#666', marginBottom: 6 },
  cardBottom:     { flexDirection: 'row', justifyContent: 'space-between' },
  distance:       { fontSize: 12, color: '#888' },
  brand:          { fontSize: 12, color: '#2d6a4f', fontWeight: 'bold' },
  callButton:     { marginTop: 10, borderWidth: 1, borderColor: '#2d6a4f', borderRadius: 8, padding: 10, alignItems: 'center' },
  callButtonText: { color: '#2d6a4f', fontWeight: 'bold', fontSize: 14 },
  bottomNav:      { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 8, elevation: 8 },
  navItem:        { alignItems: 'center', justifyContent: 'center', minWidth: 72 },
  navIcon:        { fontSize: 22, lineHeight: 24, color: '#6c757d' },
  navIconActive:  { color: '#2d6a4f' },
  navLabel:       { marginTop: 4, fontSize: 11, color: '#6c757d', fontWeight: '600' },
  navLabelActive: { color: '#2d6a4f' },
});
