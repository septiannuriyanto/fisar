// src/notifications/firebase.ts
import * as admin from 'firebase-admin';
import serviceAccount from '../../assets/fff-project-f6b71-firebase-adminsdk-fbsvc-3ca1134914.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export { admin };
