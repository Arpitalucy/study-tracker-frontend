Deploying Updates to Production

1. FRONTEND:
   - Ensure your Firebase config is correct in `src/firebase.ts`.
   - Ensure `public/firebase-messaging-sw.js` is updated.
   - Run:
     git add .
     git commit -m "Update frontend with Firebase notifications"
     git push origin main (or whatever your remote is)

2. BACKEND:
   - I have updated `requirements.txt` to include `firebase-admin` and `apscheduler`.
   - I have updated `main.py` to allow loading credentials from Environment Variables.
   - Run:
     cd backend
     git add .
     git commit -m "Add Firebase backend support and fix CORS"
     git push origin main (or whatever your remote is, e.g. `railway`)

3. RAILWAY SETUP (CRITICAL):
   - Go to your Railway Project Dashboard -> Variables.
   - Create a new variable named: `FIREBASE_ADMIN_KEY`
   - Paste the ENTIRE content of your `firebase-service-account.json` into this value.
   - Create another variable: `TIMEZONE` and set it to `Asia/Kolkata` (optional but good).
   - Redeploy the backend.
