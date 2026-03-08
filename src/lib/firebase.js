// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB73qiogsIeVvE0AKkCjgdBH5eMf6n-jIw",
    authDomain: "travox-c21f3.firebaseapp.com",
    projectId: "travox-c21f3",
    storageBucket: "travox-c21f3.firebasestorage.app",
    messagingSenderId: "709079153188",
    appId: "1:709079153188:web:57e8f848d72780eb99f6b1",
    measurementId: "G-GHZQQ0S8CP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };
