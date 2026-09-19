import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBAB_nWexO6iW9RGPmfsqXVjhDWpnlSXoU",
  authDomain: "zenvy-store-43ca0.firebaseapp.com",
  databaseURL: "https://zenvy-store-43ca0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zenvy-store-43ca0",
  storageBucket: "zenvy-store-43ca0.firebasestorage.app",
  messagingSenderId: "469849085917",
  appId: "1:469849085917:web:efe5625260eaa28ab30834"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
