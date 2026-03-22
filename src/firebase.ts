import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, getDocFromServer, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Types
// ... existing types ...
export interface UserProfile {
  email: string;
  name: string;
  role: 'admin' | 'student' | 'guest';
}

export interface UserProgress {
  studied: string[];
  favorites: string[];
}

export interface AnswerData {
  text: string;
  images: string[];
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

// User Management
export const getUserProfile = async (email: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${email}`);
    return null;
  }
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', profile.email), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${profile.email}`);
  }
};

// Progress Tracking
export const getUserProgress = (email: string, callback: (progress: UserProgress) => void) => {
  const progressDoc = doc(db, 'user_progress', email);
  return onSnapshot(progressDoc, (snapshot) => {
    const data = snapshot.data();
    callback({
      studied: data?.studied || [],
      favorites: data?.favorites || []
    });
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `user_progress/${email}`);
  });
};

export const toggleProgress = async (email: string, type: 'studied' | 'favorites', id: string, active: boolean) => {
  try {
    const progressDoc = doc(db, 'user_progress', email);
    await setDoc(progressDoc, {
      [type]: active ? arrayUnion(id) : arrayRemove(id)
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `user_progress/${email}`);
  }
};

// Answers Management
export const getAnswer = (answerId: string, callback: (data: AnswerData) => void) => {
  const answerDoc = doc(db, 'answers', answerId);
  return onSnapshot(answerDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as AnswerData);
    } else {
      callback({ text: '', images: [] });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `answers/${answerId}`);
  });
};

export const updateAnswerData = async (answerId: string, update: Partial<AnswerData>) => {
  try {
    const answerDoc = doc(db, 'answers', answerId);
    await setDoc(answerDoc, update, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `answers/${answerId}`);
  }
};

// Subjects Management
export const getSubjects = (callback: (subjects: any[]) => void) => {
  const subjectsCol = collection(db, 'subjects');
  return onSnapshot(subjectsCol, (snapshot) => {
    const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(subjects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'subjects');
  });
};

export const addSubjectToDb = async (subject: any) => {
  try {
    await setDoc(doc(db, 'subjects', subject.id), subject);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `subjects/${subject.id}`);
  }
};

export const removeSubjectFromDb = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'subjects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `subjects/${id}`);
  }
};

// Questions Management
export const getQuestions = (subjectId: string, series: string, part: string, callback: (questions: any[]) => void) => {
  const questionsCol = collection(db, 'questions');
  // Note: In a real app, we'd use a query here. 
  // For simplicity in this environment, we'll filter client-side or use a simple query if possible.
  return onSnapshot(questionsCol, (snapshot) => {
    const questions = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((q: any) => q.subjectId === subjectId && q.series === series && q.part === part);
    callback(questions);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'questions');
  });
};

export const addQuestionToDb = async (question: any) => {
  try {
    const docRef = doc(collection(db, 'questions'));
    await setDoc(docRef, { ...question, id: docRef.id });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'questions');
  }
};

export const removeQuestionFromDb = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'questions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `questions/${id}`);
  }
};
