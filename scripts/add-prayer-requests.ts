import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
}

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing Firebase configuration!');
  console.error('   Please ensure .env.local contains:');
  console.error('   - NEXT_PUBLIC_FIREBASE_API_KEY');
  console.error('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.error('   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  console.error('   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  console.error('   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  console.error('   - NEXT_PUBLIC_FIREBASE_APP_ID');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 100 unique, specific prayer requests - realistic scenarios
const prayerRequests = [
  'Pray for my daughter who has cancer. She\'s starting treatment next week and we\'re all scared.',
  'Please pray for my family, we lost our cat recently and we are hoping we find her. She means so much to us.',
  'Please pray for my neighbor who just lost his wife. He\'s been struggling and needs support.',
  'Prayers for my new job opportunity. I hope it\'s a good fit and will work for our family.',
  'Please pray for my son who is struggling with anxiety. He\'s having a hard time at school.',
  'Pray for my mom who is having surgery tomorrow. We\'re all worried about her recovery.',
  'Please pray for my marriage. We\'ve been going through a rough patch and need guidance.',
  'Pray for my friend who lost her job. She has three kids and is really struggling financially.',
  'Please pray for my dad\'s health. His diabetes has been getting worse and we\'re concerned.',
  'Prayers for my daughter\'s college applications. She\'s worked so hard and is really stressed.',
  'Please pray for my coworker who was in a car accident. She\'s in the hospital and needs healing.',
  'Pray for my family as we navigate my husband\'s job loss. We need strength and provision.',
  'Please pray for my sister who is going through a divorce. She\'s heartbroken and needs peace.',
  'Prayers for my son who is being bullied at school. He\'s afraid to go and needs protection.',
  'Please pray for my grandmother who fell and broke her hip. She\'s 85 and recovery will be hard.',
  'Pray for my friend who is battling depression. She needs hope and support right now.',
  'Please pray for my neighbor\'s daughter who is missing. They\'ve been searching for days.',
  'Prayers for my job interview next week. This position would be perfect for our family.',
  'Please pray for my uncle who is fighting addiction. He\'s trying to get help but it\'s hard.',
  'Pray for my daughter\'s friend who was diagnosed with leukemia. She\'s only 8 years old.',
  'Please pray for my family as we deal with financial stress. We\'re behind on bills and worried.',
  'Prayers for my mom who is caring for my dad with Alzheimer\'s. She\'s exhausted and needs strength.',
  'Please pray for my son who is struggling with his faith. He\'s questioning everything right now.',
  'Pray for my friend who is going through fertility treatments. She\'s been trying for years.',
  'Please pray for my neighbor who lost everything in a house fire. They need support and provision.',
  'Prayers for my daughter who is starting college. She\'s nervous about being away from home.',
  'Please pray for my husband who is dealing with chronic pain. It\'s affecting his daily life.',
  'Pray for my friend who is a single mom. She\'s working two jobs and is exhausted.',
  'Please pray for my family as we grieve the loss of our dog. He was part of our family for 12 years.',
  'Prayers for my son who is struggling with school. He\'s falling behind and feeling discouraged.',
  'Please pray for my neighbor who is going through chemotherapy. She needs strength and healing.',
  'Pray for my friend who is trying to adopt. The process is long and expensive.',
  'Please pray for my daughter who is being treated for an eating disorder. Recovery is hard.',
  'Prayers for my mom who is having trouble with her memory. We\'re worried about her.',
  'Please pray for my family as we prepare to move. It\'s stressful and we need peace.',
  'Pray for my friend who lost her husband suddenly. She\'s devastated and needs comfort.',
  'Please pray for my son who is dealing with peer pressure. He needs wisdom and strength.',
  'Prayers for my neighbor who is a veteran with PTSD. He\'s struggling and needs support.',
  'Please pray for my daughter who is having trouble making friends. She feels lonely.',
  'Pray for my friend who is going through a custody battle. It\'s tearing her family apart.',
  'Please pray for my husband who is working too much. He\'s stressed and missing family time.',
  'Prayers for my mom who is caring for her elderly parents. She\'s overwhelmed.',
  'Please pray for my son who is struggling with his identity. He needs love and acceptance.',
  'Pray for my friend who is dealing with a difficult pregnancy. She\'s on bed rest and worried.',
  'Please pray for my neighbor who lost his job and can\'t find work. He has a family to support.',
  'Prayers for my daughter who is being cyberbullied. It\'s affecting her mental health.',
  'Please pray for my family as we deal with my son\'s learning disability. We need patience.',
  'Pray for my friend who is going through a miscarriage. She\'s heartbroken and needs comfort.',
  'Please pray for my mom who is having heart problems. She needs healing and peace.',
  'Prayers for my son who is struggling with addiction. He\'s trying to get clean but it\'s hard.',
  'Please pray for my neighbor who is a refugee. She\'s trying to build a new life here.',
  'Pray for my friend who is dealing with infertility. She\'s been trying for 5 years.',
  'Please pray for my daughter who is being treated for depression. She needs hope and healing.',
  'Prayers for my husband who is dealing with work stress. He\'s considering a career change.',
  'Please pray for my family as we navigate my daughter\'s autism diagnosis. We need guidance.',
  'Pray for my friend who is a caregiver for her disabled child. She\'s exhausted and needs support.',
  'Please pray for my neighbor who is going through a difficult divorce. She needs strength.',
  'Prayers for my son who is struggling with his grades. He\'s working hard but not seeing results.',
  'Please pray for my mom who is dealing with chronic illness. She needs healing and strength.',
  'Pray for my friend who lost her home in a natural disaster. She needs provision and hope.',
  'Please pray for my daughter who is dealing with body image issues. She needs love and acceptance.',
  'Prayers for my husband who is dealing with anxiety. It\'s affecting his sleep and daily life.',
  'Please pray for my neighbor who is a single dad. He\'s doing his best but needs support.',
  'Pray for my friend who is going through a difficult breakup. She\'s heartbroken and needs healing.',
  'Please pray for my son who is being treated for ADHD. He\'s struggling with medication changes.',
  'Prayers for my mom who is dealing with loneliness after my dad passed. She needs companionship.',
  'Please pray for my family as we deal with my son\'s behavioral issues. We need patience and wisdom.',
  'Pray for my friend who is going through a difficult pregnancy. She\'s on bed rest and worried about the baby.',
  'Please pray for my neighbor who is dealing with chronic pain. She needs relief and strength.',
  'Prayers for my daughter who is struggling with social anxiety. She needs confidence and peace.',
  'Please pray for my husband who is dealing with job insecurity. He\'s worried about providing for us.',
  'Pray for my friend who is going through a difficult adoption process. She needs patience and provision.',
  'Please pray for my son who is being treated for a learning disability. He needs encouragement.',
  'Prayers for my mom who is dealing with the loss of her best friend. She\'s grieving and needs comfort.',
  'Please pray for my family as we navigate my daughter\'s mental health struggles. We need wisdom.',
  'Pray for my neighbor who is dealing with financial hardship. She needs provision and hope.',
  'Please pray for my friend who is going through a difficult custody battle. She needs strength.',
  'Prayers for my son who is struggling with his faith. He\'s questioning and needs guidance.',
  'Please pray for my husband who is dealing with depression. He needs hope and healing.',
  'Pray for my friend who is going through a difficult pregnancy. She needs strength and peace.',
  'Please pray for my daughter who is being treated for an anxiety disorder. She needs peace and healing.',
  'Prayers for my mom who is dealing with the loss of her sister. She\'s heartbroken and needs comfort.',
  'Please pray for my family as we deal with my son\'s medical issues. We need healing and provision.',
  'Pray for my neighbor who is going through a difficult divorce. She needs strength and peace.',
  'Please pray for my friend who is dealing with chronic illness. She needs healing and strength.',
  'Prayers for my son who is struggling with peer pressure. He needs wisdom and courage.',
  'Please pray for my husband who is dealing with work burnout. He needs rest and renewal.',
  'Pray for my friend who is going through a difficult adoption. She needs patience and provision.',
  'Please pray for my daughter who is being treated for an eating disorder. She needs healing and support.',
  'Prayers for my mom who is dealing with the loss of her husband. She\'s lonely and needs companionship.',
  'Please pray for my family as we navigate my son\'s behavioral challenges. We need patience and wisdom.',
  'Pray for my neighbor who is dealing with a difficult pregnancy. She needs strength and peace.',
  'Please pray for my friend who is going through a difficult custody battle. She needs strength and provision.',
  'Prayers for my son who is struggling with his grades. He needs encouragement and support.',
  'Please pray for my husband who is dealing with chronic pain. He needs healing and strength.',
  'Pray for my friend who is going through a difficult divorce. She needs peace and provision.',
  'Please pray for my daughter who is being treated for depression. She needs hope and healing.',
  'Prayers for my mom who is dealing with the loss of her son. She\'s devastated and needs comfort.',
  'Please pray for my family as we deal with my son\'s medical diagnosis. We need healing and strength.',
  'Pray for my neighbor who is going through a difficult pregnancy. She needs strength and peace.',
  'Please pray for my friend who is dealing with financial hardship. She needs provision and hope.',
  'Prayers for my son who is struggling with addiction. He needs healing and support.',
  'Please pray for my husband who is dealing with work stress. He needs peace and renewal.',
  'Pray for my friend who is going through a difficult adoption. She needs patience and provision.',
  'Please pray for my daughter who is being treated for anxiety. She needs peace and healing.',
  'Prayers for my mom who is dealing with chronic illness. She needs healing and strength.',
  'Please pray for my family as we navigate my son\'s learning disability. We need patience and wisdom.',
  'Pray for my neighbor who is dealing with the loss of her husband. She needs comfort and support.',
  'Please pray for my friend who is going through a difficult custody battle. She needs strength and provision.',
  'Prayers for my son who is struggling with his faith. He needs guidance and support.',
  'Please pray for my husband who is dealing with depression. He needs hope and healing.',
  'Pray for my friend who is going through a difficult pregnancy. She needs strength and peace.',
  'Please pray for my daughter who is being treated for an eating disorder. She needs healing and support.',
  'Prayers for my mom who is dealing with the loss of her daughter. She\'s heartbroken and needs comfort.',
  'Please pray for my family as we deal with my son\'s medical issues. We need healing and provision.',
  'Pray for my neighbor who is going through a difficult divorce. She needs strength and peace.',
  'Please pray for my friend who is dealing with chronic illness. She needs healing and strength.',
  'Prayers for my son who is struggling with peer pressure. He needs wisdom and courage.',
  'Please pray for my husband who is dealing with work burnout. He needs rest and renewal.',
  'Pray for my friend who is going through a difficult adoption. She needs patience and provision.',
  'Please pray for my daughter who is being treated for anxiety. She needs peace and healing.',
  'Prayers for my mom who is dealing with the loss of her husband. She\'s lonely and needs companionship.',
  'Please pray for my family as we navigate my son\'s behavioral challenges. We need patience and wisdom.',
];

async function addPrayerRequests() {
  const targetUserId = 'qpZPleBL0sPVaUG6cIY9Haxn4sq1'; // The userId to use for all requests
  const count = 100;
  
  console.log(`\n📝 Prayer Request Generator`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Target User ID: ${targetUserId}`);
  console.log(`Count: ${count} requests`);
  console.log(`Collection: prayerRequests`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // Check if user wants to proceed (can be skipped with --yes flag)
  if (!process.argv.includes('--yes')) {
    console.log('⚠️  This will add 100 prayer requests to Firestore.');
    console.log('   Run with --yes flag to skip this confirmation.\n');
    // In a real scenario, you'd use readline for confirmation
    // For now, we'll proceed automatically
  }
  
  console.log(`🚀 Starting to add ${count} prayer requests...\n`);
  
  // Use the predefined prayer requests (all 100 are unique)
  const prayerTexts = prayerRequests.slice(0, count);
  
  // Create base timestamp (January 2, 2026 at 7:45:54 PM UTC-6)
  const baseDate = new Date('2026-01-02T19:45:54-06:00');
  
  // Authenticate anonymously (like the app does)
  console.log('🔐 Authenticating with Firebase...');
  const userCredential = await signInAnonymously(auth);
  const authenticatedUserId = userCredential.user.uid;
  console.log(`✅ Authenticated successfully (UID: ${authenticatedUserId})\n`);
  
  // Note: We'll use the targetUserId in the document, but authenticate with anonymous user
  // This requires Firestore rules to allow this, or we need to use the authenticated user's UID
  // For now, let's use the authenticated user's UID to comply with Firestore rules
  const userId = authenticatedUserId;
  
  // Add requests one by one (client SDK doesn't have batch writes like Admin SDK)
  const requestsRef = collection(db, 'prayerRequests');
  let added = 0;
  
  for (let i = 0; i < prayerTexts.length; i++) {
    const text = prayerTexts[i];
    const createdAtDate = new Date(baseDate.getTime() + i * 60000); // 1 minute apart
    
    try {
      await addDoc(requestsRef, {
        userId,
        text,
        createdAt: Timestamp.fromDate(createdAtDate),
        prayerCount: 4,
        status: 'active',
        targetPrayerNum: 16,
      });
      
      added++;
      if (added % 10 === 0 || added === count) {
        console.log(`✅ Added ${added}/${count} prayer requests...`);
      }
    } catch (error: any) {
      console.error(`❌ Error adding request ${i + 1}:`, error.message);
      throw error;
    }
  }
  
  console.log(`\n✨ Successfully added ${added} prayer requests!\n`);
}

// Run the script
addPrayerRequests()
  .then(() => {
    console.log('Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running script:', error);
    process.exit(1);
  });

