# Firebase Functions for Pray It Forward

This directory contains Cloud Functions for the Pray It Forward app.

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Build the functions:
```bash
npm run build
```

## Deploy

To deploy functions to Firebase:
```bash
npm run deploy
```

Or from the root directory:
```bash
firebase deploy --only functions
```

## Functions

### submitPrayer

Handles prayer submissions with the following features:
- Creates prayer document in Firestore
- Updates prayer request stats (prayerCount, bucket)
- Updates user stats (prayersGiven)
- Sends notifications (placeholder - implement FCM as needed)

**Parameters:**
- `requestId`: The ID of the prayer request
- `prayerText`: The text of the prayer
- `userId`: The ID of the user submitting the prayer

**Returns:**
- `success`: Boolean indicating success
- `prayerId`: ID of the created prayer document
- `prayerCount`: Updated prayer count for the request

## Development

To test functions locally:
```bash
npm run serve
```

This will start the Firebase emulators.

