// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// TODO: USER MUST REPLACE THESE VALUES
const firebaseConfig = {
    apiKey: "AIzaSyDWrydnTmYtRG265ZTDbyZ_9pd0oaeeDhQ",
    authDomain: "arpita-studytracker.firebaseapp.com",
    projectId: "arpita-studytracker",
    storageBucket: "arpita-studytracker.firebasestorage.app",
    messagingSenderId: "850656939425",
    appId: "1:850656939425:web:09a812e77bd0cade770fe0"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/study-icon.png' // Ensure this icon exists or use a default
    };

    // self.registration.showNotification(notificationTitle, notificationOptions);
});
