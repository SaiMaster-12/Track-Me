import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAOMpZb8p2C3g7fpdYJSs3YfhvR0CXOLsI",
  authDomain: "track-me-b4b8b.firebaseapp.com",
  databaseURL: "https://track-me-b4b8b-default-rtdb.firebaseio.com",
  projectId: "track-me-b4b8b",
  storageBucket: "track-me-b4b8b.firebasestorage.app",
  messagingSenderId: "1064753310265",
  appId: "1:1064753310265:web:fe9007ab7ce09f1738fbe8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;


