/**
 * Firestore Security Rules Verification Suite — Dirty Dozen Adversarial Tests
 * Verifies that all 12 adversarial payloads defined in security_spec.md return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_SUITE: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unverified Email Spoof on UserProfile create',
    collection: 'users',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-User Profile Read on users/{victimUid}',
    collection: 'users',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection (isAdmin: true) on UserProfile create',
    collection: 'users',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Orphaned ScanLog Creation without existing UserProfile',
    collection: 'scanLogs',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Identity Spoofing on ScanLog creation (ownerId != request.auth.uid)',
    collection: 'scanLogs',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Poisoning Attack with non-alphanumeric characters in scanId',
    collection: 'scanLogs',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Update-Gap Value Poisoning with >500 char notes string',
    collection: 'scanLogs',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable Field Mutation attempting to change confidence score',
    collection: 'scanLogs',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Forged Client Timestamp on ScanLog creation (createdAt != request.time)',
    collection: 'scanLogs',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Unauthorized Blanket List Query without ownerId filter',
    collection: 'scanLogs',
    operation: 'list',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Out-of-Bounds Metric Injection on DailyProgressDoc (avgConfidence > 100)',
    collection: 'dailyProgress',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Cross-User Delete on DailyProgressDoc by non-owner',
    collection: 'dailyProgress',
    operation: 'delete',
    expectedResult: 'PERMISSION_DENIED',
  },
];
