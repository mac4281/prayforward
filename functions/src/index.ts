import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

admin.initializeApp();
const db = admin.firestore();

// Helper: Update user ratio
async function updateUserRatio(userId: string): Promise<void> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        // This shouldn't happen in normal flow, but if it does, initialize with defaults
        // Note: We can't determine if anonymous here, so we'll skip isAnonymous
        await userRef.set({
            prayersCompleted: 0,
            requestsSubmitted: 0,
            personalRatio: 0,
            prayerRequestCredits: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
    }
    const userData = userDoc.data();
    const requestsSubmitted = userData?.requestsSubmitted || 0;
    const prayersCompleted = userData?.prayersCompleted || 0;
    // Calculate personal ratio: prayersCompleted / max(1, requestsSubmitted)
    const personalRatio = prayersCompleted / Math.max(1, requestsSubmitted);
    await userRef.update({
        personalRatio: Math.round(personalRatio * 100) / 100, // Round to 2 decimal places
    });
}

// Helper: Update global ratio
async function updateGlobalRatio(): Promise<void> {
    const globalRef = db.collection('stats').doc('global');
    const globalDoc = await globalRef.get();
    if (!globalDoc.exists) {
        // Initialize global stats if they don't exist
        await globalRef.set({
            prayersCompleted: 0,
            requestsSubmitted: 0,
            globalRatio: 0,
        });
        return;
    }
    const globalData = globalDoc.data();
    const requestsSubmitted = globalData?.requestsSubmitted || 0;
    const prayersCompleted = globalData?.prayersCompleted || 0;
    // Calculate global ratio: prayersCompleted / max(1, requestsSubmitted)
    const globalRatio = prayersCompleted / Math.max(1, requestsSubmitted);
    await globalRef.update({
        globalRatio: Math.round(globalRatio * 100) / 100, // Round to 2 decimal places
    });
}

// Helper: Calculate target prayer number
// Uses the larger of (personalRatio + 10) or (globalRatio + 10), whichever is higher
async function calculateTargetPrayerNum(userPersonalRatio: number, globalRatio: number): Promise<number> {
    const targetPrayerNum = Math.max(userPersonalRatio + 10, globalRatio + 10);
    // Round up to ensure we have at least the ratio (can't have partial prayers)
    return Math.ceil(targetPrayerNum);
}

// Helper: Send push notification to request owner
async function sendPrayerNotification(requestOwnerId: string, requestId: string, prayerCount: number): Promise<void> {
    try {
        // Get request owner's user document to fetch notification token
        const ownerRef = db.collection('users').doc(requestOwnerId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            console.log(`[sendPrayerNotification] Owner ${requestOwnerId} not found, skipping notification`);
            return;
        }

        const ownerData = ownerDoc.data();
        const notificationToken = ownerData?.notificationToken;

        if (!notificationToken) {
            console.log(`[sendPrayerNotification] Owner ${requestOwnerId} has no notification token, skipping notification`);
            return;
        }

        // Get request text for notification (truncate if needed)
        const requestRef = db.collection('prayerRequests').doc(requestId);
        const requestDoc = await requestRef.get();
        let requestText = "someone prayed for you";
        if (requestDoc.exists) {
            const requestData = requestDoc.data();
            const text = requestData?.text || "";
            requestText = text.length > 50 ? text.substring(0, 50) + "..." : text;
        }

        // Send FCM notification
        const message = {
            notification: {
                title: "Someone prayed for you 🙏",
                body: `${prayerCount} ${prayerCount === 1 ? 'prayer' : 'prayers'} received. "${requestText}"`,
            },
            data: {
                type: "prayer",
                requestId: requestId,
                prayerCount: prayerCount.toString(),
            },
            token: notificationToken,
            apns: {
                payload: {
                    aps: {
                        sound: "notification.caf",
                        badge: prayerCount
                    }
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log(`[sendPrayerNotification] ✅ Successfully sent notification to ${requestOwnerId}: ${response}`);
    } catch (error: any) {
        // Log error but don't throw - notification failures shouldn't break prayer submission
        console.error(`[sendPrayerNotification] ❌ Error sending notification to ${requestOwnerId}:`, error);

        // If token is invalid, remove it from the user document
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            console.log(`[sendPrayerNotification] Removing invalid token for user ${requestOwnerId}`);
            await db.collection('users').doc(requestOwnerId).update({
                notificationToken: admin.firestore.FieldValue.delete(),
            });
        }
    }
}

// Cloud Function: prayForRequest (Callable)
export const prayForRequest = functions.https.onCall(async (data: any, context?: functions.https.CallableContext) => {
    // Verify authentication
    if (!context || !context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to pray for a request');
    }
    const userId = context.auth.uid;
    const { requestId, prayerText } = data;
    if (!requestId || typeof requestId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'requestId is required and must be a string');
    }
    if (!prayerText || typeof prayerText !== 'string' || prayerText.trim().length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'prayerText is required and must be a non-empty string');
    }

    // Get request from prayerRequests collection
    const requestRef = db.collection('prayerRequests').doc(requestId);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Prayer request not found');
    }
    const requestData = requestDoc.data();

    // Check if request is already complete
    if (requestData?.status === 'complete') {
        throw new functions.https.HttpsError('failed-precondition', 'This prayer request is already complete');
    }

    const userRef = db.collection('users').doc(userId);
    const globalRef = db.collection('stats').doc('global');
    const prayersRef = db.collection('prayers');

    // Use transaction to ensure atomicity
    return db.runTransaction(async (transaction) => {
        // Re-fetch request document in transaction
        const requestDocInTransaction = await transaction.get(requestRef);
        if (!requestDocInTransaction.exists) {
            throw new functions.https.HttpsError('not-found', 'Prayer request not found');
        }
        const requestDataInTransaction = requestDocInTransaction.data();

        // Get user document
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.exists ? userDoc.data() : {
            prayersCompleted: 0,
            requestsSubmitted: 0,
            personalRatio: 0,
        };

        // Get global stats
        const globalDoc = await transaction.get(globalRef);
        const globalData = globalDoc.exists ? globalDoc.data() : {
            prayersCompleted: 0,
            requestsSubmitted: 0,
            globalRatio: 0,
        };

        // Increment counters
        const newPrayerCount = (requestDataInTransaction?.prayerCount || 0) + 1;
        const newUserPrayersCompleted = (userData?.prayersCompleted || 0) + 1;
        const newGlobalPrayersCompleted = (globalData?.prayersCompleted || 0) + 1;
        console.log(`[prayForRequest] Request ${requestId}: prayerCount ${requestDataInTransaction?.prayerCount || 0} → ${newPrayerCount}`);

        // Create prayer document
        const prayerDocRef = prayersRef.doc();
        transaction.set(prayerDocRef, {
            userId,
            requestId,
            prayerText: prayerText.trim(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update request with new prayer count
        transaction.update(requestRef, {
            prayerCount: newPrayerCount,
        });

        // Check if user is anonymous (no email or phone means anonymous)
        const isAnonymous = !context.auth.token.email && !context.auth.token.phone_number;

        // Update user stats
        // Note: prayerRequestCredits are granted client-side based on session count (like iOS app)
        if (userDoc.exists) {
            transaction.update(userRef, {
                prayersCompleted: newUserPrayersCompleted,
            });
        } else {
            transaction.set(userRef, {
                prayersCompleted: newUserPrayersCompleted,
                requestsSubmitted: 0,
                personalRatio: 0,
                prayerRequestCredits: 0,
                isAnonymous: isAnonymous,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Update global stats
        if (globalDoc.exists) {
            transaction.update(globalRef, {
                prayersCompleted: newGlobalPrayersCompleted,
            });
        } else {
            transaction.set(globalRef, {
                prayersCompleted: globalData?.prayersCompleted || 0,
                requestsSubmitted: globalData?.requestsSubmitted || 0,
                globalRatio: 0,
            });
        }

        // Check if request reached target
        const targetPrayerNum = requestDataInTransaction?.targetPrayerNum || 10;
        if (newPrayerCount >= targetPrayerNum) {
            // Mark as complete
            transaction.update(requestRef, {
                status: 'complete',
            });
        }

        return {
            success: true,
            prayerCount: newPrayerCount,
            isComplete: newPrayerCount >= targetPrayerNum,
            prayerId: prayerDocRef.id,
        };
    }).then(async (result) => {
        // Recalculate ratios after transaction (outside transaction to avoid conflicts)
        await Promise.all([
            updateUserRatio(userId),
            updateGlobalRatio(),
        ]);

        // Send notification to request owner (if different user)
        // Get request data again to ensure we have the latest
        const updatedRequestDoc = await requestRef.get();
        if (updatedRequestDoc.exists) {
            const updatedRequestData = updatedRequestDoc.data();
            const requestOwnerId = updatedRequestData?.userId;
            if (requestOwnerId && requestOwnerId !== userId) {
                // Send notification asynchronously - don't wait for it
                sendPrayerNotification(requestOwnerId, requestId, result.prayerCount).catch((error) => {
                    console.error(`[prayForRequest] Error sending notification:`, error);
                });
            }
        }

        return result;
    }).catch((error: any) => {
        console.error('Error in prayForRequest:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process prayer', error.message);
    });
});

// Cloud Function: submitPrayerRequest (Callable)
export const submitPrayerRequest = functions.https.onCall(async (data: any, context?: functions.https.CallableContext) => {
    // Verify authentication
    if (!context || !context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to submit a prayer request');
    }
    const userId = context.auth.uid;
    const { text } = data;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'text is required and must be a non-empty string');
    }

    const userRef = db.collection('users').doc(userId);
    const globalRef = db.collection('stats').doc('global');

    // Use transaction to ensure atomicity
    return db.runTransaction(async (transaction) => {
        // Get user document
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.exists ? userDoc.data() : {
            prayersCompleted: 0,
            requestsSubmitted: 0,
            personalRatio: 0,
        };

        // Get global stats
        const globalDoc = await transaction.get(globalRef);
        const globalData = globalDoc.exists ? globalDoc.data() : {
            prayersCompleted: 0,
            requestsSubmitted: 0,
            globalRatio: 0,
        };

        // Increment counters
        const newUserRequestsSubmitted = (userData?.requestsSubmitted || 0) + 1;
        const newGlobalRequestsSubmitted = (globalData?.requestsSubmitted || 0) + 1;

        // Check if user is anonymous (no email or phone means anonymous)
        const isAnonymous = !context.auth.token.email && !context.auth.token.phone_number;
        
        // Update user stats
        if (userDoc.exists) {
            // Decrement prayer request credit if user has one
            const currentCredits = userData?.prayerRequestCredits || 0;
            const updateData: any = {
                requestsSubmitted: newUserRequestsSubmitted,
            };
            if (currentCredits > 0) {
                updateData.prayerRequestCredits = currentCredits - 1;
            }
            transaction.update(userRef, updateData);
        } else {
            transaction.set(userRef, {
                prayersCompleted: 0,
                requestsSubmitted: newUserRequestsSubmitted,
                personalRatio: 0,
                prayerRequestCredits: 0,
                isAnonymous: isAnonymous,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Update global stats
        if (globalDoc.exists) {
            transaction.update(globalRef, {
                requestsSubmitted: newGlobalRequestsSubmitted,
            });
        } else {
            transaction.set(globalRef, {
                prayersCompleted: globalData?.prayersCompleted || 0,
                requestsSubmitted: newGlobalRequestsSubmitted,
                globalRatio: 0,
            });
        }

        // Calculate target prayer number
        const personalRatio = userData?.personalRatio || 0;
        const globalRatio = globalData?.globalRatio || 0;
        const targetPrayerNum = await calculateTargetPrayerNum(personalRatio, globalRatio);

        // Create request document
        const requestRef = db.collection('prayerRequests').doc();
        transaction.set(requestRef, {
            userId,
            text: text.trim(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            prayerCount: 0,
            targetPrayerNum,
            status: 'active',
        });

        return {
            requestId: requestRef.id,
            targetPrayerNum,
        };
    }).then(async (result) => {
        // Recalculate ratios after transaction
        await Promise.all([
            updateUserRatio(userId),
            updateGlobalRatio(),
        ]);
        return result;
    }).catch((error: any) => {
        console.error('Error in submitPrayerRequest:', error);
        throw new functions.https.HttpsError('internal', 'Failed to submit prayer request', error.message);
    });
});

// Trigger: onPrayerCountUpdated - checks if request should be marked complete
export const onPrayerCountUpdated = functions.firestore
    .document('prayerRequests/{requestId}')
    .onUpdate(async (change: functions.Change<admin.firestore.DocumentSnapshot>, context: functions.EventContext) => {
        const after = change.after.data();
        const requestId = context.params.requestId;
        // Only process if prayer count increased and request is still active
        if (after?.status === 'active' && after?.prayerCount >= after?.targetPrayerNum) {
            await db.collection('prayerRequests').doc(requestId).update({
                status: 'complete',
            });
            console.log(`Request ${requestId} marked as complete (prayerCount: ${after?.prayerCount}, target: ${after?.targetPrayerNum})`);
        }
        return null;
    });

// Cloud Function: resetAllPrayerRequests (Callable) - Admin function for testing
export const resetAllPrayerRequests = functions.https.onCall(async (data: any, context?: functions.https.CallableContext) => {
    // Verify authentication
    if (!context || !context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        // Get all prayer requests
        const requestsSnapshot = await db.collection('prayerRequests').get();
        // Batch update all requests to reset them
        const batch = db.batch();
        let count = 0;
        requestsSnapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
                prayerCount: 0,
                status: 'active',
            });
            count++;
        });
        // Commit the batch
        await batch.commit();
        console.log(`[resetAllPrayerRequests] Reset ${count} prayer requests`);
        return {
            success: true,
            count,
        };
    } catch (error: any) {
        console.error('Error resetting prayer requests:', error);
        throw new functions.https.HttpsError('internal', 'Failed to reset prayer requests', error.message);
    }
});

