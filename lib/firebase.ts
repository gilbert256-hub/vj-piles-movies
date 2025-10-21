
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDWU4qaAtKkXADLbkW9RyOHt4AsDeuNK7Y",
  authDomain: "vj-piles-movies.firebaseapp.com",
  databaseURL: "https://vj-piles-movies-default-rtdb.firebaseio.com",
  projectId: "vj-piles-movies",
  storageBucket: "vj-piles-movies.firebasestorage.app",
  messagingSenderId: "626723987897",
  appId: "1:626723987897:web:38469fbbcc953c1d759668",
  measurementId: "G-CNF67MQ3FJ"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
