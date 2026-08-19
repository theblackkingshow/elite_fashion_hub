import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, OrderConfirmation, UserProfile } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with specific firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Error logging conforming to FirestoreErrorInfo spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
    return false;
  }
}

// Notification log interface
export interface TransactionalNotification {
  id: string;
  orderId: string;
  recipient: string;
  channel: 'email' | 'sms';
  type: 'order_receipt' | 'shipping_update' | 'delivery_confirmed';
  subject: string;
  body: string;
  status: 'delivered' | 'sent' | 'queued' | 'simulated';
  trackingNumber?: string;
  carrier?: string;
  provider: 'Resend' | 'SendGrid' | 'Twilio';
  sentAt: string;
}

// Cloud Database API Services
export const cloudDb = {
  // Sync products from cloud
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => d.data() as Product);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  // Save/Update product in cloud
  async saveProduct(product: Product): Promise<void> {
    const path = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  // Delete product from cloud
  async deleteProduct(productId: string): Promise<void> {
    const path = `products/${productId}`;
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      throw err;
    }
  },

  // Batch seed initial products to cloud if empty
  async seedInitialProducts(products: Product[]): Promise<void> {
    try {
      const existing = await this.getProducts();
      if (existing.length === 0) {
        for (const prod of products) {
          await this.saveProduct(prod);
        }
      }
    } catch (err) {
      console.error('Initial product seed error:', err);
    }
  },

  // Save Order to Cloud
  async saveOrder(order: OrderConfirmation): Promise<void> {
    const path = `orders/${order.orderId}`;
    try {
      await setDoc(doc(db, 'orders', order.orderId), order);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  // Get All Orders from Cloud
  async getOrders(): Promise<OrderConfirmation[]> {
    const path = 'orders';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => d.data() as OrderConfirmation);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  // Save Transactional Notification Log to Cloud
  async logNotification(notification: TransactionalNotification): Promise<void> {
    const path = `notifications/${notification.id}`;
    try {
      await setDoc(doc(db, 'notifications', notification.id), notification);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Get Notifications
  async getNotifications(): Promise<TransactionalNotification[]> {
    const path = 'notifications';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => d.data() as TransactionalNotification);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  // Real-time listener for orders
  subscribeOrders(onUpdate: (orders: OrderConfirmation[]) => void) {
    const path = 'orders';
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list = snapshot.docs.map((d) => d.data() as OrderConfirmation);
          onUpdate(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  // Real-time listener for products
  subscribeProducts(onUpdate: (products: Product[]) => void) {
    const path = 'products';
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list = snapshot.docs.map((d) => d.data() as Product);
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  // Save/Update User Profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.uid}`;
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      throw err;
    }
  },

  // Get User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },
};

// Auth helper utilities
export const authService = {
  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Auto-create/sync UserProfile in Firestore
    const existing = await cloudDb.getUserProfile(user.uid);
    if (!existing) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Atelier Patron',
        photoURL: user.photoURL || undefined,
        tier: 'Atelier Member',
        createdAt: new Date().toISOString(),
        savedAddresses: [],
        wishlistIds: [],
        ordersCount: 0,
      };
      await cloudDb.saveUserProfile(newProfile);
    }
    return user;
  },

  // Sign in with Email / Password
  async signInWithEmail(email: string, pass: string): Promise<User> {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  },

  // Register with Email / Password
  async registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(res.user, { displayName });
    }
    const newProfile: UserProfile = {
      uid: res.user.uid,
      email: res.user.email || email,
      displayName: displayName || email.split('@')[0] || 'Atelier Patron',
      tier: 'Atelier Member',
      createdAt: new Date().toISOString(),
      savedAddresses: [],
      wishlistIds: [],
      ordersCount: 0,
    };
    await cloudDb.saveUserProfile(newProfile);
    return res.user;
  },

  // Sign Out
  async signOut(): Promise<void> {
    await signOut(auth);
  },

  // Subscribe to auth state
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
