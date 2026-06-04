import AsyncStorage from '@react-native-async-storage/async-storage';

const memStore = {};

const storage = {
  getItem: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val;
    } catch (err) {
      console.log('AsyncStorage getItem fallback used:', err.message);
      return memStore[key] || null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.log('AsyncStorage setItem fallback used:', err.message);
      memStore[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.log('AsyncStorage removeItem fallback used:', err.message);
      delete memStore[key];
    }
  }
};

export default storage;
