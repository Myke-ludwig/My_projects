import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxot6pgz3wIJxhUOQDJUPIY549sNmmSz4",
  authDomain: "bountyboard233.firebaseapp.com",
  projectId: "bountyboard233",
  storageBucket: "bountyboard233.firebasestorage.app",
  messagingSenderId: "95176809414",
  appId: "1:95176809414:web:c031c0e781349ac41eb0c7",
  measurementId: "G-DV25XJQBTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database for App.jsx
export const db = getFirestore(app);