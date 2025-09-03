// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import type { Activity, Settings } from '../types';

// Din Firebase config (får du från Firebase Console)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Activity Service
export const activityService = {
  async getAll(): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, 'activities'),
        orderBy('year', 'desc'),
        orderBy('week', 'desc')
      );
      const querySnapshot = await getDocs(q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Activity));
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  async getByWeek(week: number, year: number): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, 'activities'),
        where('week', '==', week),
        where('year', '==', year)
      );
      const querySnapshot = await getDocs(q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Activity));
    } catch (error) {
      console.error('Error fetching week activities:', error);
      throw error;
    }
  },

  async create(activities: Activity[]): Promise<Activity[]> {
    try {
      const batch = writeBatch(db);
      const newActivities: Activity[] = [];
      
      activities.forEach(activity => {
        const docRef = doc(collection(db, 'activities'), activity.id);
        batch.set(docRef, activity);
        newActivities.push(activity);
      });
      
      await batch.commit();
      return newActivities;
    } catch (error) {
      console.error('Error creating activities:', error);
      throw error;
    }
  },

  async update(activity: Activity): Promise<Activity> {
    try {
      const docRef = doc(db, 'activities', activity.id);
      await updateDoc(docRef, {
        ...activity,
        updatedAt: new Date().toISOString()
      });
      return activity;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  async deleteSeries(seriesId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'activities'),
        where('seriesId', '==', seriesId)
      );
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      querySnapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting series:', error);
      throw error;
    }
  }
};

// Settings Service
export const settingsService = {
  async get(): Promise<Settings> {
    try {
      const docRef = doc(db, 'settings', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Settings;
      } else {
        // Create default settings
        const defaultSettings: Settings = {
          showWeekends: false,
          dayStart: 7,
          dayEnd: 18
        };
        await setDoc(docRef, defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings on error
      return {
        showWeekends: false,
        dayStart: 7,
        dayEnd: 18
      };
    }
  },

  async update(settings: Settings): Promise<Settings> {
    try {
      const docRef = doc(db, 'settings', 'main');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      return settings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
};