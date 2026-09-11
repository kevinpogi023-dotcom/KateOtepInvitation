// ============================================================
// FIREBASE CONFIGURATION
// Shared wedding-dashboard project — this wedding's data is
// scoped by weddingCode ('OK27') in main.js, not by project.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyB7J8vgjR5NDfp5MrdoWeGFO6orZ2sDrm8",
  authDomain: "wedding-dashboard-7fdce.firebaseapp.com",
  projectId: "wedding-dashboard-7fdce",
  storageBucket: "wedding-dashboard-7fdce.firebasestorage.app",
  messagingSenderId: "6629026699",
  appId: "1:6629026699:web:7b9aeb90422d67ad81dd8e"
};

firebase.initializeApp(firebaseConfig);

window.db = firebase.firestore();
