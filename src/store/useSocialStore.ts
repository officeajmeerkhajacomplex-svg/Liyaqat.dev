import { create } from 'zustand';
import { db, auth } from '../firebase/config';
import { 
  collection, doc, getDoc, setDoc, query, where, onSnapshot, 
  orderBy, addDoc, updateDoc, serverTimestamp, arrayUnion, Unsubscribe
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { 
  generateKeyPair, exportPublicKey, exportPrivateKey, 
  importPrivateKey, importPublicKey, encryptMessageKey, decryptMessageKey,
  generateMessageKey, encryptMessage, decryptMessage,
  generateIv, arrayBufferToBase64, base64ToArrayBuffer
} from '../lib/crypto';
import { MessageSquare, Users, UserPlus } from 'lucide-react';

function handleFirestoreError(error: any, operationType: string, path: string) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface PublicProfile {
  uid: string;
  displayName: string;
  username: string;
  photoURL: string;
  publicKey: string;
  updatedAt: any;
  isOnline?: boolean;
  lastSeen?: any;
  typingTo?: string | null;
}

export interface SocialChat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  groupImage?: string;
  adminIds?: string[];
  lastMessageAt: string;
  createdAt: string;
  // UI helper fields:
  otherParticipant?: PublicProfile;
  unreadCount?: number;
}

export interface SocialMessage {
  id: string;
  senderId: string;
  encryptedMessage: string;
  encryptedKeys: Record<string, string>;
  iv: string;
  messageType: string;
  timestamp: string;
  seenBy: string[];
  replyTo?: string;
  isDeleted?: boolean;
  reactions?: Record<string, string>; // uid -> emoji
  // UI helper fields:
  decryptedText?: string;
  isDecrypted?: boolean;
}

interface SocialState {
  isInitialized: boolean;
  publicProfile: PublicProfile | null;
  contacts: PublicProfile[];
  chats: SocialChat[];
  activeChatMessages: SocialMessage[];
  loadingChats: boolean;
  loadingMessages: boolean;
  activeChatId: string | null;
  privateKeyPem: string | null;

  initialize: () => Promise<void>;
  setActiveChat: (chatId: string | null) => void;
  startDirectChat: (otherUserId: string) => Promise<string>;
  createGroupChat: (name: string, participantIds: string[]) => Promise<string>;
  sendMessage: (chatId: string, text: string, replyTo?: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  reactToMessage: (chatId: string, messageId: string, emoji: string) => Promise<void>;
  setTypingTo: (chatId: string | null) => Promise<void>;
  cleanup: () => void;
}

let chatsUnsubscribe: Unsubscribe | null = null;
let messagesUnsubscribe: Unsubscribe | null = null;
let contactsUnsubscribe: Unsubscribe | null = null;

export const useSocialStore = create<SocialState>((set, get) => ({
  isInitialized: false,
  publicProfile: null,
  contacts: [],
  chats: [],
  activeChatMessages: [],
  loadingChats: true,
  loadingMessages: false,
  activeChatId: null,
  privateKeyPem: null,

  initialize: async () => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Setup keys
    let privKey = localStorage.getItem(`deenflow_privkey_${user.uid}`);
    let pubKey = localStorage.getItem(`deenflow_pubkey_${user.uid}`);
    const profileRef = doc(db, 'public_profiles', user.uid);
    let profileSnap = await getDoc(profileRef);

    if (!privKey || !pubKey || !profileSnap.exists()) {
      // Generate new keys
      const keyPair = await generateKeyPair();
      privKey = await exportPrivateKey(keyPair.privateKey);
      pubKey = await exportPublicKey(keyPair.publicKey);
      
      localStorage.setItem(`deenflow_privkey_${user.uid}`, privKey);
      localStorage.setItem(`deenflow_pubkey_${user.uid}`, pubKey);

      const profileData = {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous User',
        username: user.email?.split('@')[0] || 'seeker' + Math.floor(Math.random() * 1000),
        photoURL: user.photoURL || '',
        publicKey: pubKey,
        updatedAt: serverTimestamp()
      };
      await setDoc(profileRef, profileData);
      set({ publicProfile: profileData as any, privateKeyPem: privKey });
    } else {
      set({ publicProfile: profileSnap.data() as PublicProfile, privateKeyPem: privKey });
    }

    // Attempt FCM setup
    try {
      const messaging = getMessaging();
      const token = await getToken(messaging, { vapidKey: 'BHzJ...' }); // Placeholder VAPID
      if (token) {
        await updateDoc(profileRef, { fcmToken: token });
      }
      onMessage(messaging, (payload) => {
        // Simple built-in notification handling
        if (Notification.permission === 'granted') {
           new Notification(payload.notification?.title || 'New message', {
             body: payload.notification?.body,
             icon: '/icon.png'
           });
        }
      });
    } catch(e) {
      console.log('FCM not configured or permission denied', e);
    }

    // 2. Load Contacts (all public profiles for now, except self)
    const contactsQuery = collection(db, 'public_profiles');
    contactsUnsubscribe = onSnapshot(contactsQuery, (snapshot) => {
      const contactsData = snapshot.docs
        .map(d => d.data() as PublicProfile)
        .filter(p => p.uid !== user.uid);
      set({ contacts: contactsData });
    }, (error) => {
      console.error("Contacts list error:", error);
    });

    // 3. Load Chats
    const chatsQuery = query(
      collection(db, 'social_chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    chatsUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => {
        const data = doc.data() as SocialChat;
        data.id = doc.id;
        
        // Handle Firestore timestamps
        const lma = data.lastMessageAt as any;
        if (lma && lma.toDate) data.lastMessageAt = lma.toDate().toISOString();
        
        // Find other participant for direct chats
        if (data.type === 'direct') {
          const otherId = data.participants.find(p => p !== user.uid);
          data.otherParticipant = get().contacts.find(c => c.uid === otherId);
        }
        return data;
      });
      set({ chats: chatsData, loadingChats: false, isInitialized: true });
      
      // Update contacts for contacts that might have loaded after chats
      set(state => {
         const updatedChats = state.chats.map(chat => {
            if (chat.type === 'direct' && !chat.otherParticipant) {
              const otherId = chat.participants.find(p => p !== user.uid);
              chat.otherParticipant = state.contacts.find(c => c.uid === otherId);
            }
            return chat;
         });
         return { chats: updatedChats };
      });
    }, (error) => {
      console.error("Chats query error:", error);
    });
  },

  setActiveChat: (chatId: string | null) => {
    set({ activeChatId: chatId });
    
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
      messagesUnsubscribe = null;
    }

    if (!chatId) {
       set({ activeChatMessages: [] });
       return;
    }

    set({ loadingMessages: true });
    
    const messagesQuery = query(
      collection(db, `social_chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    messagesUnsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      const messagesData = snapshot.docs.map(doc => {
        const data = doc.data() as SocialMessage;
        const ts = data.timestamp as any;
        if (ts && ts.toDate) data.timestamp = ts.toDate().toISOString();
        return { id: doc.id, ...data };
      });
      
      // Decrypt messages
      const state = get();
      if (!state.privateKeyPem) return;
      const privKey = await importPrivateKey(state.privateKeyPem);
      
      const decryptedMessages = await Promise.all(messagesData.map(async (msg) => {
        if (msg.isDecrypted) return msg;
        try {
          const myEncryptedAESKeyB64 = msg.encryptedKeys[auth.currentUser!.uid];
          if (!myEncryptedAESKeyB64) {
             msg.decryptedText = "Message cannot be decrypted (no key for you).";
             return msg;
          }
          
          const aesKey = await decryptMessageKey(myEncryptedAESKeyB64, privKey);
          const iv = base64ToArrayBuffer(msg.iv);
          msg.decryptedText = await decryptMessage(msg.encryptedMessage, aesKey, new Uint8Array(iv));
          msg.isDecrypted = true;
        } catch (err) {
          console.error("Failed to decrypt message:", err);
          msg.decryptedText = "Failed to decrypt message.";
        }
        return msg;
      }));

      set({ activeChatMessages: decryptedMessages, loadingMessages: false });
    }, (error) => {
      console.error("Messages query error:", error);
      set({ loadingMessages: false });
    });
  },

  startDirectChat: async (otherUserId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    // Check if chat already exists
    const existingChat = get().chats.find(c => 
      c.type === 'direct' && c.participants.includes(otherUserId) && c.participants.includes(user.uid)
    );
    if (existingChat) {
      return existingChat.id;
    }

    // Create new chat
    const newChatRef = await addDoc(collection(db, 'social_chats'), {
      type: 'direct',
      participants: [user.uid, otherUserId],
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return newChatRef.id;
  },

  createGroupChat: async (name: string, participantIds: string[]) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const allParticipants = [...participantIds, user.uid];
    
    const newChatRef = await addDoc(collection(db, 'social_chats'), {
      type: 'group',
      name,
      adminIds: [user.uid],
      participants: allParticipants,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return newChatRef.id;
  },

  sendMessage: async (chatId: string, text: string, replyTo?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    
    const chat = get().chats.find(c => c.id === chatId);
    if (!chat) throw new Error("Chat not found");

    // Cryptography setup
    const sessionKey = await generateMessageKey();
    const iv = generateIv();
    const encryptedMessageString = await encryptMessage(text, sessionKey, iv);

    const encryptedKeys: Record<string, string> = {};
    
    // Encrypt AES key for each participant
    for (const pId of chat.participants) {
       // We need their public key
       let pubKeyString = '';
       if (pId === user.uid) {
         pubKeyString = get().publicProfile!.publicKey;
       } else {
         const contact = get().contacts.find(c => c.uid === pId);
         if (contact) pubKeyString = contact.publicKey;
       }
       
       if (pubKeyString) {
         const pubKey = await importPublicKey(pubKeyString);
         encryptedKeys[pId] = await encryptMessageKey(sessionKey, pubKey);
       }
    }

    const newMessage: any = {
      senderId: user.uid,
      encryptedMessage: encryptedMessageString,
      encryptedKeys,
      iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
      messageType: 'text',
      timestamp: serverTimestamp(),
      seenBy: [user.uid]
    };
    if (replyTo) newMessage.replyTo = replyTo;

    // Add message
    await addDoc(collection(db, `social_chats/${chatId}/messages`), newMessage);
    
    // Update chat lastMessageAt
    await updateDoc(doc(db, 'social_chats', chatId), {
      lastMessageAt: serverTimestamp()
    });
  },

  deleteChat: async (chatId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const chatRef = doc(db, 'social_chats', chatId);
    try {
      const snap = await getDoc(chatRef);
      if (!snap.exists()) return;
      
      const data = snap.data() as SocialChat;
      const updatedParticipants = data.participants.filter(p => p !== user.uid);
      
      get().setActiveChat(null);
      
      await updateDoc(chatRef, {
        participants: updatedParticipants
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `social_chats/${chatId}`);
    }
  },

  deleteMessage: async (chatId: string, messageId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const path = `social_chats/${chatId}/messages/${messageId}`;
    try {
      const msgRef = doc(db, path);
      await updateDoc(msgRef, {
        isDeleted: true
      });
    } catch (error) {
      handleFirestoreError(error, 'update', path);
    }
  },

  reactToMessage: async (chatId: string, messageId: string, emoji: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const path = `social_chats/${chatId}/messages/${messageId}`;
    try {
      const msgRef = doc(db, path);
      const msg = get().activeChatMessages.find(m => m.id === messageId);
      if (!msg) return;

      let reactions = msg.reactions || {};
      if (reactions[user.uid] === emoji) {
         // Toggle off
         const newReactions = { ...reactions };
         delete newReactions[user.uid];
         await updateDoc(msgRef, { reactions: newReactions });
      } else {
         await updateDoc(msgRef, { reactions: { ...reactions, [user.uid]: emoji } });
      }
    } catch (error) {
      handleFirestoreError(error, 'update', path);
    }
  },

  setTypingTo: async (chatId: string | null) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
       const profileRef = doc(db, 'public_profiles', user.uid);
       if (chatId) {
         await updateDoc(profileRef, { typingTo: chatId, isOnline: true, lastSeen: serverTimestamp() });
       } else {
         await updateDoc(profileRef, { typingTo: null, isOnline: true, lastSeen: serverTimestamp() });
       }
    } catch(e) {
      // ignore
    }
  },

  cleanup: () => {
    if (chatsUnsubscribe) chatsUnsubscribe();
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (contactsUnsubscribe) contactsUnsubscribe();
    chatsUnsubscribe = null;
    messagesUnsubscribe = null;
    contactsUnsubscribe = null;
    set({ isInitialized: false, chats: [], activeChatMessages: [], contacts: [], publicProfile: null, privateKeyPem: null, activeChatId: null });
  }
}));
