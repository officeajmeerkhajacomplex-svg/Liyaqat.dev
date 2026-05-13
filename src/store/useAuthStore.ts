import { create } from 'zustand';
import { 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  username?: string;
  photoURL: string | null;
  avatarIcon?: string;
  avatarColor?: string;
  notificationsEnabled?: boolean;
  bio?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setProfile: (profile: UserProfile | null) => void;
  initialize: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setProfile: (profile) => set({ profile }),
  initialize: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          const defaultUsername = user.email?.split('@')[0] || 'seeker' + Math.floor(Math.random() * 1000);
          const newProfile = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || 'Seeker',
            username: defaultUsername,
            photoURL: user.photoURL,
            avatarIcon: 'User',
            avatarColor: '#10B981',
            notificationsEnabled: true,
            bio: '',
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          set({ user, profile: newProfile as any, loading: false, initialized: true });
        } else {
          const profileData = userDoc.data() as UserProfile;
          if (!profileData.avatarIcon || !profileData.avatarColor || profileData.notificationsEnabled === undefined || !profileData.username) {
            const updates: any = {
              avatarIcon: profileData.avatarIcon || 'User',
              avatarColor: profileData.avatarColor || '#10B981',
              notificationsEnabled: profileData.notificationsEnabled ?? true,
              bio: profileData.bio ?? '',
              username: profileData.username || profileData.email.split('@')[0] || 'seeker' + Math.floor(Math.random() * 1000),
            };
            await updateDoc(doc(db, 'users', user.uid), updates);
            set({ user, profile: { ...profileData, ...updates }, loading: false, initialized: true });
          } else {
            set({ user, profile: profileData, loading: false, initialized: true });
          }
        }
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, profile: null });
  },
}));
