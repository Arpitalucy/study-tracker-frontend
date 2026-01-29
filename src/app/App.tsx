import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Toaster } from './components/ui/sonner';
import { useEffect, useState } from 'react';

// Import screens
import Login from './components/screens/Login';
import Signup from './components/screens/Signup';
import Dashboard from './components/screens/Dashboard';
import SubjectManagement from './components/screens/SubjectManagement';
import ChapterManagement from './components/screens/ChapterManagement';
import NotificationCenter from './components/screens/NotificationCenter';
import Analytics from './components/screens/Analytics';
import { requestForToken, onMessageListener } from '../firebase';
import { api } from './api/api';
import { toast } from 'sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const auth = localStorage.getItem('studyTracker_auth');
    const token = localStorage.getItem('studyTracker_token');
    setIsAuthenticated(!!(auth && token));

    // Setup daily notifications
    setupDailyNotifications();

    // FCM Token Logic
    if (isAuthenticated) {
      requestForToken().then((token) => {
        if (token) {
          api.saveFCMToken(token).catch(err => console.error("Failed to save FCM token", err));
          toast.success("Notifications enabled!");
        } else {
          toast.error("Notification permission not granted.");
        }
      }).catch(err => {
        console.error("FCM Error:", err);
        toast.error(`FCM Error: ${err.message || err}`);
      });

      onMessageListener().then((payload: any) => {
        const title = payload?.notification?.title || "New Notification";
        const body = payload?.notification?.body;

        // Show in-app toast
        toast(title, {
          description: body,
        });

        // Show system notification even if in foreground (since user requested "browser notification")
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/study-icon.png'
          });
        }
      });
    }
  }, [isAuthenticated]);

  const setupDailyNotifications = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Good morning notification (8 AM)
    if (currentHour === 8) {
      showMorningNotification();
    }

    // Good night notification (10 PM)
    if (currentHour === 22) {
      showNightNotification();
    }
  };

  const showMorningNotification = () => {
    const quotes = [
      "Every morning is a new opportunity to chase your dreams!",
      "Success is the sum of small efforts repeated day in and day out.",
      "The expert in anything was once a beginner.",
      "Believe you can and you're halfway there."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Good Morning! 🌅', {
        body: randomQuote,
        icon: '/study-icon.png'
      });
    }
  };

  const showNightNotification = () => {
    const today = new Date().toDateString();
    const studyData = JSON.parse(localStorage.getItem('studyTracker_todayProgress') || '{}');
    const targetCompleted = studyData[today]?.completed || false;

    let message = '';
    if (targetCompleted) {
      message = "Great job today! You've completed your targets. Rest well! 😊";
    } else {
      message = "Today's target is incomplete. Remember, if you don't work for your dream, someone else surely will. 💪";
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Good Night! 🌙', {
        body: message,
        icon: '/study-icon.png'
      });
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            !isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />
          } />
          <Route path="/signup" element={
            !isAuthenticated ? <Signup setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />
          } />

          {/* Protected Routes */}
          <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
            <Route path="/dashboard" element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            } />
            <Route path="/subjects" element={
              isAuthenticated ? <SubjectManagement /> : <Navigate to="/login" />
            } />
            <Route path="/subjects/:subjectId/chapters" element={
              isAuthenticated ? <ChapterManagement /> : <Navigate to="/login" />
            } />
            <Route path="/notifications" element={
              isAuthenticated ? <NotificationCenter /> : <Navigate to="/login" />
            } />
            <Route path="/analytics" element={
              isAuthenticated ? <Analytics /> : <Navigate to="/login" />
            } />
          </Route>

          {/* Default Route */}
          <Route path="/" element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
          } />
        </Routes>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;