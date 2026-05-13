import { create } from 'zustand';
import { db, auth } from '../firebase/config';
import { 
  collection, doc, getDoc, setDoc, query, where, onSnapshot, 
  orderBy, addDoc, updateDoc, serverTimestamp, arrayUnion, Unsubscribe
} from 'firebase/firestore';
import { 
  generateKeyPair, exportPublicKey, exportPrivateKey, 
  importPrivateKey, importPublicKey, encryptMessageKey, decryptMessageKey,
  generateMessageKey, encryptMessage, decryptMessage,
  generateIv, arrayBufferToBase64, base64ToArrayBuffer
} from '../lib/crypto';
import { MessageSquare, Users, UserPlus } from 'lucide-react';

export interface PublicProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  publicKey: string;
  updatedAt: string;
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
  sendMessage: (chatId: string, text: string) => Promise<void>;
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
        photoURL: user.photoURL || '',
        publicKey: pubKey,
        updatedAt: serverTimestamp()
      };
      await setDoc(profileRef, profileData);
      set({ publicProfile: profileData as PublicProfile, privateKeyPem: privKey });
    } else {
      set({ publicProfile: profileSnap.data() as PublicProfile, privateKeyPem: privKey });
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

  sendMessage: async (chatId: string, text: string) => {
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

    const newMessage = {
      senderId: user.uid,
      encryptedMessage: encryptedMessageString,
      encryptedKeys,
      iv: arrayBufferToBase64(iv.buffer),
      messageType: 'text',
      timestamp: serverTimestamp(),
      seenBy: [user.uid]
    };

    // Add message
    await addDoc(collection(db, `social_chats/${chatId}/messages`), newMessage);
    
    // Update chat lastMessageAt
    await updateDoc(doc(db, 'social_chats', chatId), {
      lastMessageAt: serverTimestamp()
    });
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
