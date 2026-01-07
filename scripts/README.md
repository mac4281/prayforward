# Add Prayer Requests Script

This script adds 100 AI-generated prayer requests to the Firestore `prayerRequests` collection.

## Usage

### Option 1: Using npm script (Recommended)
```bash
npm run add-prayers
```

### Option 2: Direct execution
```bash
npx tsx scripts/add-prayer-requests.ts
```

### Skip confirmation
```bash
npm run add-prayers -- --yes
```

## Authentication

The script needs Firebase Admin credentials. You have two options:

### Option 1: Service Account Key (Recommended for scripts)
1. Download your Firebase service account key from the Firebase Console
2. Save it as `serviceAccountKey.json` in the project root
3. The script will automatically use it

### Option 2: Application Default Credentials
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. The script will use your logged-in credentials

## What the script does

- Generates 100 unique prayer requests covering:
  - Family prayers
  - Business prayers
  - Health prayers
  - Relationship prayers
  - Career prayers
  - Financial prayers
  - And more...
  
- Each request includes:
  - `userId`: REdwvPOqpLfUuCYxN4sIxYs1IzF2
  - `text`: AI-generated prayer request text
  - `createdAt`: Timestamp (starting from January 2, 2026)
  - `prayerCount`: 4
  - `status`: "active"
  - `targetPrayerNum`: 16

## Notes

- The script uses batch writes (up to 500 per batch) for efficiency
- Requests are spaced 1 minute apart in timestamps
- All requests are set to "active" status with prayerCount of 4


