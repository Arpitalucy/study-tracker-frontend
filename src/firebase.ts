import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// TODO: Replace with your actual Firebase project config
// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyDWrydnTmYtRG265ZTDbyZ_9pd0oaeeDhQ",
    authDomain: "arpita-studytracker.firebaseapp.com",
    projectId: "arpita-studytracker",
    storageBucket: "arpita-studytracker.firebasestorage.app",
    messagingSenderId: "850656939425",
    appId: "1:850656939425:web:09a812e77bd0cade770fe0"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = async () => {
    try {
        const currentToken = await getToken(messaging, { vapidKey: "BJ7nk8sU-zKuwFxfy4yDFy9yZWgxVXi80ZUguAfO8MIHKnrY7WL9ITWJuBQ_h4ggmqUokWxPQTDEyfnJ_yKQBNU" });
        if (currentToken) {
            console.log('current token for client: ', currentToken);
            return currentToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
