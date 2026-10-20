import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  DailyEngagementPoint,
  INITIAL_DAILY_PROGRESS,
  INITIAL_SCAN_LOGS,
  ScanLogEntry,
} from './data/botanicalData';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Sanitization helpers matching firebase-blueprint.json constraints
const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

function sanitizeSafeId(raw: string, maxLen = 128): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, maxLen);
  return cleaned.length > 0 && ID_REGEX.test(cleaned) ? cleaned : 'doc_1';
}

function clampNumber(val: number, min: number, max: number): number {
  if (Number.isNaN(val) || !Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfileAndSeedData(result.user);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function ensureUserProfileAndSeedData(user: User): Promise<void> {
  const uid = sanitizeSafeId(user.uid, 128);
  const userDocPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  let existsAlready = false;
  try {
    const snap = await getDoc(userRef);
    existsAlready = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
  }

  const displayName =
    (user.displayName || 'Student Botanist').trim().slice(0, 100) ||
    'Student Botanist';
  const photoURL = (user.photoURL || '').trim().slice(0, 500);

  if (!existsAlready) {
    try {
      await setDoc(userRef, {
        uid,
        displayName,
        photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userDocPath);
    }

    // Seed initial dailyProgress & scanLogs if user has none yet
    for (let i = 0; i < INITIAL_DAILY_PROGRESS.length; i++) {
      const point = INITIAL_DAILY_PROGRESS[i];
      const progressId = sanitizeSafeId(`${uid}_${point.day}`, 128);
      const progressPath = `dailyProgress/${progressId}`;
      try {
        await setDoc(doc(db, 'dailyProgress', progressId), {
          id: progressId,
          ownerId: uid,
          day: point.day.slice(0, 32),
          dateLabel: point.dateLabel.slice(0, 32),
          sortOrder: clampNumber(i, 0, 366),
          totalScans: clampNumber(point.totalScans, 0, 100000),
          verifiedTriggers: clampNumber(point.verifiedTriggers, 0, 100000),
          noiseRejected: clampNumber(point.noiseRejected, 0, 100000),
          avgConfidence: clampNumber(point.avgConfidence, 0, 100),
          leafHealthIndex: clampNumber(point.leafHealthIndex, 0, 100),
          chlorophyllSpad: clampNumber(point.chlorophyllSpad, 0, 100),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, progressPath);
      }
    }

    for (const log of INITIAL_SCAN_LOGS) {
      const scanId = sanitizeSafeId(`${uid}_${log.id}`, 128);
      const scanPath = `scanLogs/${scanId}`;
      try {
        await setDoc(doc(db, 'scanLogs', scanId), {
          id: scanId,
          ownerId: uid,
          timestamp: log.timestamp.slice(0, 32),
          specimenId: sanitizeSafeId(log.specimenId, 64),
          specimenName: log.specimenName.slice(0, 120),
          scientificName: log.scientificName.slice(0, 120),
          category: log.category,
          confidence: clampNumber(log.confidence, 0, 100),
          chlorophyllSpad: clampNumber(log.chlorophyllSpad, 0, 100),
          laminaIntegrity: clampNumber(log.laminaIntegrity, 0, 100),
          audioSpoken: Boolean(log.audioSpoken),
          sourceMode: log.sourceMode,
          notes: (log.notes || '').slice(0, 500),
          bookmarked: Boolean(log.bookmarked),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, scanPath);
      }
    }
  }
}

export async function saveScanLogToFirestore(
  uid: string,
  entry: ScanLogEntry
): Promise<void> {
  const safeUid = sanitizeSafeId(uid, 128);
  const scanId = sanitizeSafeId(
    entry.id.startsWith(safeUid) ? entry.id : `${safeUid}_${entry.id}`,
    128
  );
  const scanPath = `scanLogs/${scanId}`;
  try {
    await setDoc(doc(db, 'scanLogs', scanId), {
      id: scanId,
      ownerId: safeUid,
      timestamp: (entry.timestamp || '00:00:00').slice(0, 32),
      specimenId: sanitizeSafeId(entry.specimenId, 64),
      specimenName: (entry.specimenName || 'Specimen').slice(0, 120),
      scientificName: (entry.scientificName || 'Botanical').slice(0, 120),
      category: entry.category,
      confidence: clampNumber(entry.confidence, 0, 100),
      chlorophyllSpad: clampNumber(entry.chlorophyllSpad, 0, 100),
      laminaIntegrity: clampNumber(entry.laminaIntegrity, 0, 100),
      audioSpoken: Boolean(entry.audioSpoken),
      sourceMode: entry.sourceMode,
      notes: (entry.notes || '').slice(0, 500),
      bookmarked: Boolean(entry.bookmarked),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, scanPath);
  }
}

export async function updateScanNoteInFirestore(
  scanId: string,
  note: string
): Promise<void> {
  const safeId = sanitizeSafeId(scanId, 128);
  const scanPath = `scanLogs/${safeId}`;
  try {
    await updateDoc(doc(db, 'scanLogs', safeId), {
      notes: (note || '').slice(0, 500),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, scanPath);
  }
}

export async function toggleScanBookmarkInFirestore(
  scanId: string,
  bookmarked: boolean
): Promise<void> {
  const safeId = sanitizeSafeId(scanId, 128);
  const scanPath = `scanLogs/${safeId}`;
  try {
    await updateDoc(doc(db, 'scanLogs', safeId), {
      bookmarked: Boolean(bookmarked),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, scanPath);
  }
}

export async function updateDailyProgressInFirestore(
  uid: string,
  point: DailyEngagementPoint
): Promise<void> {
  const safeUid = sanitizeSafeId(uid, 128);
  const progressId = sanitizeSafeId(`${safeUid}_${point.day}`, 128);
  const progressPath = `dailyProgress/${progressId}`;
  try {
    await updateDoc(doc(db, 'dailyProgress', progressId), {
      totalScans: clampNumber(point.totalScans, 0, 100000),
      verifiedTriggers: clampNumber(point.verifiedTriggers, 0, 100000),
      noiseRejected: clampNumber(point.noiseRejected, 0, 100000),
      avgConfidence: clampNumber(point.avgConfidence, 0, 100),
      leafHealthIndex: clampNumber(point.leafHealthIndex, 0, 100),
      chlorophyllSpad: clampNumber(point.chlorophyllSpad, 0, 100),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, progressPath);
  }
}

export async function resetUserLogsInFirestore(uid: string): Promise<void> {
  const safeUid = sanitizeSafeId(uid, 128);
  const logsQuery = query(
    collection(db, 'scanLogs'),
    where('ownerId', '==', safeUid)
  );
  try {
    const snap = await getDocs(logsQuery);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'scanLogs', d.id));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'scanLogs');
  }

  for (const log of INITIAL_SCAN_LOGS) {
    const scanId = sanitizeSafeId(`${safeUid}_${log.id}`, 128);
    try {
      await setDoc(doc(db, 'scanLogs', scanId), {
        id: scanId,
        ownerId: safeUid,
        timestamp: log.timestamp.slice(0, 32),
        specimenId: sanitizeSafeId(log.specimenId, 64),
        specimenName: log.specimenName.slice(0, 120),
        scientificName: log.scientificName.slice(0, 120),
        category: log.category,
        confidence: clampNumber(log.confidence, 0, 100),
        chlorophyllSpad: clampNumber(log.chlorophyllSpad, 0, 100),
        laminaIntegrity: clampNumber(log.laminaIntegrity, 0, 100),
        audioSpoken: Boolean(log.audioSpoken),
        sourceMode: log.sourceMode,
        notes: (log.notes || '').slice(0, 500),
        bookmarked: Boolean(log.bookmarked),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `scanLogs/${scanId}`);
    }
  }

  for (const point of INITIAL_DAILY_PROGRESS) {
    const progressId = sanitizeSafeId(`${safeUid}_${point.day}`, 128);
    try {
      await updateDoc(doc(db, 'dailyProgress', progressId), {
        totalScans: clampNumber(point.totalScans, 0, 100000),
        verifiedTriggers: clampNumber(point.verifiedTriggers, 0, 100000),
        noiseRejected: clampNumber(point.noiseRejected, 0, 100000),
        avgConfidence: clampNumber(point.avgConfidence, 0, 100),
        leafHealthIndex: clampNumber(point.leafHealthIndex, 0, 100),
        chlorophyllSpad: clampNumber(point.chlorophyllSpad, 0, 100),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `dailyProgress/${progressId}`
      );
    }
  }
}

export function subscribeToUserTelemetry(
  uid: string,
  onScanLogs: (logs: ScanLogEntry[]) => void,
  onDailyProgress: (points: DailyEngagementPoint[]) => void
): () => void {
  const safeUid = sanitizeSafeId(uid, 128);

  const logsQ = query(
    collection(db, 'scanLogs'),
    where('ownerId', '==', safeUid)
  );
  const unsubLogs = onSnapshot(
    logsQ,
    (snapshot) => {
      if (snapshot.empty) return;
      const items: ScanLogEntry[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id,
          timestamp: data.timestamp,
          specimenId: data.specimenId,
          specimenName: data.specimenName,
          scientificName: data.scientificName,
          category: data.category,
          confidence: Number(data.confidence),
          chlorophyllSpad: Number(data.chlorophyllSpad),
          laminaIntegrity: Number(data.laminaIntegrity),
          audioSpoken: Boolean(data.audioSpoken),
          sourceMode: data.sourceMode,
          notes: data.notes || '',
          bookmarked: Boolean(data.bookmarked),
        };
      });
      items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      onScanLogs(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scanLogs');
    }
  );

  const progressQ = query(
    collection(db, 'dailyProgress'),
    where('ownerId', '==', safeUid)
  );
  const unsubProgress = onSnapshot(
    progressQ,
    (snapshot) => {
      if (snapshot.empty) return;
      const rawDocs = snapshot.docs.map((d) => d.data());
      rawDocs.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
      const points: DailyEngagementPoint[] = rawDocs.map((data) => ({
        day: data.day,
        dateLabel: data.dateLabel || data.day,
        totalScans: Number(data.totalScans),
        verifiedTriggers: Number(data.verifiedTriggers),
        noiseRejected: Number(data.noiseRejected ?? 0),
        avgConfidence: Number(data.avgConfidence),
        leafHealthIndex: Number(data.leafHealthIndex ?? 90),
        chlorophyllSpad: Number(data.chlorophyllSpad ?? 44),
      }));
      onDailyProgress(points);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dailyProgress');
    }
  );

  return () => {
    unsubLogs();
    unsubProgress();
  };
}
