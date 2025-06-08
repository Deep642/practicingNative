import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAWhXCF_A4o1gUM92WJnlwdGuNXRlt1uOk',
  authDomain: 'myfirstblogweb-c4c49.firebaseapp.com',
  projectId: 'myfirstblogweb-c4c49',
  storageBucket: 'myfirstblogweb-c4c49.appspot.com',
  messagingSenderId: '452469497269',
  appId: '1:452469497269:web:f911563b839e2265390dfc',
  measurementId: 'G-B4E2M4H8DT',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
