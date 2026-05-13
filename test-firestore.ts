import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    // We sign in as existing user
    console.log("Signing in...");
    await signInWithEmailAndPassword(auth, 'office.ajmeerkhajacomplex@gmail.com', 'Testpassword123!');
  } catch (e: any) {
    console.error("Auth error:", e);
    // User might not exist or password might be different, let's just abort
    process.exit(1);
  }
  
  const user = auth.currentUser;
  if (!user) return;
  console.log("Logged in as", user.uid);
  
  try {
    const profileRef = doc(db, 'public_profiles', user.uid);
    console.log("Setting profile...");
    await setDoc(profileRef, {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      publicKey: 'test_key',
      updatedAt: serverTimestamp()
    });
    console.log("Profile set OK");
  } catch (e) { console.error("Profile set failed:", e); }
  
  try {
    console.log("Creating social chat...");
    const chatRef = await addDoc(collection(db, 'social_chats'), {
      type: 'direct',
      participants: [user.uid, 'another_uid'],
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    console.log("Chat created OK", chatRef.id);
    
    console.log("Sending message...");
    await addDoc(collection(db, `social_chats/${chatRef.id}/messages`), {
      senderId: user.uid,
      encryptedMessage: 'test',
      encryptedKeys: { 'another_uid': 'key' },
      iv: 'iv',
      messageType: 'text',
      timestamp: serverTimestamp(),
      seenBy: [user.uid]
    });
    console.log("Message sent OK");
  } catch (e) { console.error("Chat operations failed:", e); }
  
  process.exit(0);
}

run();
