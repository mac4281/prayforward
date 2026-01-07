# Setting Up Firebase Credentials for Scripts

The script needs Firebase Admin credentials to write to Firestore. Here's how to set it up:

## Option 1: Service Account Key (Recommended)

1. Go to Firebase Console: https://console.firebase.google.com/project/pray-it-forward/settings/serviceaccounts/adminsdk

2. Click **"Generate new private key"**

3. Save the downloaded JSON file as `serviceAccountKey.json` in the project root (same directory as `package.json`)

4. **Important:** Add `serviceAccountKey.json` to `.gitignore` to keep it secure:
   ```
   echo "serviceAccountKey.json" >> .gitignore
   ```

5. Run the script:
   ```bash
   npm run add-prayers
   ```

## Option 2: gcloud Application Default Credentials

1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install

2. Authenticate:
   ```bash
   gcloud auth application-default login
   ```

3. Run the script:
   ```bash
   npm run add-prayers
   ```

## Security Note

⚠️ **Never commit `serviceAccountKey.json` to git!** It contains sensitive credentials that give full access to your Firebase project.

