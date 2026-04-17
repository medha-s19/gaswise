// database.js
// Module 5: Managing data using SQLite
// All database operations are kept here in one place — easy to explain!

import SQLite from 'react-native-sqlite-storage';

// Open (or create) the database file
const db = SQLite.openDatabase({ name: 'gasalert.db', location: 'default' });

// ─── Create tables if they don't exist yet ───────────────────────────────────
export const createTables = () => {
  db.transaction(tx => {

    // bookings table — stores every cylinder booking
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS bookings (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_date TEXT,
        empty_date   TEXT,
        days_lasted  INTEGER,
        slot         TEXT
      )
    `);

    // dealers table — 5 hardcoded dealers near Anekal
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS dealers (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT,
        address TEXT,
        distance TEXT,
        stock   TEXT,
        brand   TEXT,
        phone   TEXT
      )
    `);

    // Seed dealers only if table is empty
    tx.executeSql('SELECT COUNT(*) as count FROM dealers', [], (_, result) => {
      if (result.rows.item(0).count === 0) {
        seedDealers(tx);
      }
    });
  });
};

// ─── Seed 5 dealers near Anekal ──────────────────────────────────────────────
const seedDealers = (tx) => {
  const dealers = [
    ['Sri Lakshmi Gas Agency', 'Main Road, Anekal',     '1.2 km', 'In Stock',    'HP Gas',     '9845012345'],
    ['Bharat Gas Centre',      'Bus Stand, Anekal',     '2.4 km', 'Low Stock',   'Bharat Gas', '9845023456'],
    ['Indane Distributor',     'Market Street, Anekal', '3.1 km', 'Out of Stock','Indane',     '9845034567'],
    ['Sai Gas Agency',         'Sarjapura Road',        '4.0 km', 'In Stock',    'HP Gas',     '9845045678'],
    ['Krishna Gas Service',    'Attibele Road',         '5.2 km', 'In Stock',    'Bharat Gas', '9845056789'],
  ];
  dealers.forEach(d => {
    tx.executeSql(
      'INSERT INTO dealers (name, address, distance, stock, brand, phone) VALUES (?,?,?,?,?,?)',
      d
    );
  });
};

// ─── Add a new booking ───────────────────────────────────────────────────────
export const addBooking = (bookingDate, emptyDate, daysLasted, slot) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO bookings (booking_date, empty_date, days_lasted, slot) VALUES (?,?,?,?)',
        [bookingDate, emptyDate, daysLasted, slot],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// ─── Get all bookings (newest first) ─────────────────────────────────────────
export const getBookings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM bookings ORDER BY id DESC',
        [],
        (_, result) => {
          // Convert SQLite result to a plain JS array
          const rows = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          resolve(rows);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// ─── Get average days a cylinder lasts ───────────────────────────────────────
export const getAverageDays = () => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT AVG(days_lasted) as avg FROM bookings WHERE days_lasted > 0',
        [],
        (_, result) => {
          const avg = result.rows.item(0).avg;
          resolve(avg ? Math.round(avg) : 30); // default 30 days
        }
      );
    });
  });
};

// ─── Get the most recent booking ─────────────────────────────────────────────
export const getLastBooking = () => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM bookings ORDER BY id DESC LIMIT 1',
        [],
        (_, result) => {
          resolve(result.rows.length > 0 ? result.rows.item(0) : null);
        }
      );
    });
  });
};

// ─── Get total booking count (for subsidy tracker) ───────────────────────────
export const getBookingCount = () => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM bookings',
        [],
        (_, result) => resolve(result.rows.item(0).count)
      );
    });
  });
};

// ─── Get all dealers ─────────────────────────────────────────────────────────
export const getDealers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM dealers',
        [],
        (_, result) => {
          const rows = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          resolve(rows);
        },
        (_, error) => reject(error)
      );
    });
  });
};
