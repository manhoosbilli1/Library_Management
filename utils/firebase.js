import config from '/Users/shoaib/Desktop/Library_Management/android/app/google-services.json'; // Adjust path as needed
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getFirestore, collection} from 'firebase/firestore';
import {getDatabase} from 'firebase/database';

const firebaseConfig = {
  apiKey: config.client[0].api_key[0].current_key,
  authDomain: `${config.project_info.project_id}.firebaseapp.com`,
  projectId: config.project_info.project_id,
  storageBucket: config.project_info.storage_bucket,
  messagingSenderId: config.client[0].client_info.mobilesdk_app_id,
  appId: config.client[0].client_info.mobilesdk_app_id,
  databaseURL: 'https://library-management-c5d17.firebaseio.com/',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const database = getDatabase(
  app,
  'https://library-management-c5d17.firebaseio.com/',
);

export {app, firestore, database, collection};
