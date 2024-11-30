import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKQW1SywakqYdrp9AidPVRnZO_hOckdIc",
  authDomain: "readahead-d9196.firebaseapp.com",
  projectId: "readahead-d9196",
  storageBucket: "readahead-d9196.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "368069498624",
  appId: "1:368069498624:web:1ea71be5ea1317c1fd05e5",
  measurementId: "G-0QDZBNK10R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
const analytics = getAnalytics(app); // Optional

export { db };
