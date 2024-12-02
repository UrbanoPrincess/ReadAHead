import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyCKQW1SywakqYdrp9AidPVRnZO_hOckdIc",
  authDomain: "readahead-d9196.firebaseapp.com",
  projectId: "readahead-d9196",
  storageBucket: "readahead-d9196.appspot.com",
  messagingSenderId: "368069498624",
  appId: "1:368069498624:web:1ea71be5ea1317c1fd05e5",
  measurementId: "G-0QDZBNK10R"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app); // Add authentication initialization

// Initialize Analytics only in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export the Firestore database, Auth, and Firebase config
export { db, auth, firebaseConfig };
