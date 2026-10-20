# Security Specification — The Green Medic (`firebase-blueprint.json`)

## 1. Data Invariants

1. **Global Default Deny**: Any path not explicitly matched (`/users/{userId}`, `/scanLogs/{scanId}`, `/dailyProgress/{progressId}`) is unconditionally denied (`allow read, write: if false;`).
2. **Verified Authentication Invariant**: Every read and write operation requires `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Path Variable & ID Hardening**: All single-document target operations (`get`, `create`, `update`, `delete`) validate document IDs using `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **UserProfile Isolation (`/users/{userId}`)**:
   - A user profile document can only be read (`get`), created, or updated by the user whose `request.auth.uid == userId`.
   - `list` and `delete` operations on `/users` are strictly forbidden (`allow list, delete: if false;`).
   - `uid` and `createdAt` are immutable after creation; `updatedAt` must equal `request.time`.
5. **Relational Existence & Ownership (`ScanLog` & `DailyProgressDoc`)**:
   - Neither a `ScanLog` (`/scanLogs/{scanId}`) nor a `DailyProgressDoc` (`/dailyProgress/{progressId}`) can be created unless the parent user profile `/users/$(request.auth.uid)` exists (`exists(/databases/$(database)/documents/users/$(request.auth.uid))`).
   - `ownerId` must equal `request.auth.uid` on creation and is strictly immutable on update (`incoming().ownerId == existing().ownerId`).
   - `id` must match the document ID path variable (`scanId` or `progressId`) and is immutable on update.
6. **Query Enforcer (`allow list`)**:
   - `allow list` on `/scanLogs/{scanId}` and `/dailyProgress/{progressId}` strictly enforces `resource.data.ownerId == request.auth.uid` without any `get()` or `exists()` calls inside `list`.
7. **Action-Based Updates & Strict Keys (`hasOnly` / `hasAll`)**:
   - Every `create` and `update` invokes `isValidUserProfile`, `isValidScanLog`, or `isValidDailyProgressDoc` first.
   - Updates are partitioned into explicit actions with `incoming().diff(existing()).affectedKeys().hasOnly(...)` and require `incoming().updatedAt == request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Unverified Email Spoof (`users/{userId}` create)**:
   ```json
   {
     "auth": { "uid": "user_1", "token": { "email_verified": false } },
     "path": "/users/user_1",
     "data": { "uid": "user_1", "displayName": "Spoofer", "photoURL": "", "createdAt": "SERVER_TIMESTAMP", "updatedAt": "SERVER_TIMESTAMP" }
   }
   ```
2. **Payload 2 — Cross-User Profile Read (`users/{userId}` get)**:
   ```json
   {
     "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
     "path": "/users/victim_uid",
     "operation": "get"
   }
   ```
3. **Payload 3 — Shadow Field Injection (`users/{userId}` create)**:
   ```json
   {
     "auth": { "uid": "user_1", "token": { "email_verified": true } },
     "path": "/users/user_1",
     "data": { "uid": "user_1", "displayName": "Botanist", "photoURL": "", "isAdmin": true, "createdAt": "SERVER_TIMESTAMP", "updatedAt": "SERVER_TIMESTAMP" }
   }
   ```
4. **Payload 4 — Orphaned ScanLog Creation without UserProfile (`scanLogs/{scanId}` create)**:
   ```json
   {
     "auth": { "uid": "unregistered_user", "token": { "email_verified": true } },
     "path": "/scanLogs/SCAN_1001",
     "data": { "id": "SCAN_1001", "ownerId": "unregistered_user", "timestamp": "12:00:00", "specimenId": "tulsi", "specimenName": "Holy Basil", "scientificName": "Ocimum tenuiflorum", "category": "Medicinal", "confidence": 96.4, "chlorophyllSpad": 45.2, "laminaIntegrity": 95.0, "audioSpoken": true, "sourceMode": "Live Webcam", "notes": "Valid leaf", "bookmarked": false, "createdAt": "SERVER_TIMESTAMP", "updatedAt": "SERVER_TIMESTAMP" }
   }
   ```
5. **Payload 5 — Identity Spoofing on ScanLog Creation (`scanLogs/{scanId}` create)**:
   ```json
   {
     "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
     "path": "/scanLogs/SCAN_1002",
     "data": { "id": "SCAN_1002", "ownerId": "victim_uid", "timestamp": "12:00:00", "specimenId": "tulsi", "specimenName": "Holy Basil", "scientificName": "Ocimum tenuiflorum", "category": "Medicinal", "confidence": 96.4, "chlorophyllSpad": 45.2, "laminaIntegrity": 95.0, "audioSpoken": true, "sourceMode": "Live Webcam", "notes": "", "bookmarked": false, "createdAt": "SERVER_TIMESTAMP", "updatedAt": "SERVER_TIMESTAMP" }
   }
   ```
6. **Payload 6 — ID Poisoning Attack (`scanLogs/{scanId}` create with invalid regex characters)**:
   ```json
   {
     "auth": { "uid": "user_1", "token": { "email_verified": true } },
     "path": "/scanLogs/SCAN$INVALID!ID",
     "data": { "id": "SCAN$INVALID!ID", "ownerId": "user_1", "timestamp": "12:00:00", "specimenId": "tulsi", "specimenName": "Holy Basil", "scientificName": "Ocimum tenuiflorum", "category": "Medicinal", "confidence": 96.4, "chlorophyllSpad": 45.2, "laminaIntegrity": 95.0, "audioSpoken": true, "sourceMode": "Live Webcam", "notes": "", "bookmarked": false, "createdAt": "SERVER_TIMESTAMP", "updatedAt": "SERVER_TIMESTAMP" }
   }
   ```
7. **Payload 7 — Update-Gap Value Poisoning (`scanLogs/{scanId}` update with 10KB notes string)**:
   ```json
   {
     "auth": { "uid": "user_1", "token": { "email_verified": true } },
     "path": "/scanLogs/SCAN_1001",
     "operation": "update",
     "data": { "notes": "<600-character-string-exceeding-500-limit>", "updatedAt": "SERVER_TIMESTAMP" }
   }
   ```
8. **Payload 8 — Immutable Field Mutation (`scanLogs/{scanId}` update attempting to alter `confidence` or `specimenId`)**:
   ```json
   {
     "auth": { "uid": "user_1", "token": { "email_verified": true } },
     "path": "/scanLogs/SCAN_1001",
     "operation": "update",
     "data": { "confidence": 100, "updatedAt": "SERVER_TIMESTAMP" }
   }
   ```
9. **Payload 9 — Forged Client Timestamp (`scanLogs/{scanId}` create with past timestamp)**:
   ```json
   {
     "auth": { "uid": "user_1", "token": { "email_verified": true } },
     "path": "/scanLogs/SCAN_1003",
     "data": { "id": "SCAN_1003", "ownerId": "user_1", "timestamp": "12:00:00", "specimenId": "tulsi", "specimenName": "Holy Basil", "scientificName": "Ocimum tenuiflorum", "category": "Medicinal", "confidence": 96.4, "chlorophyllSpad": 45.2, "laminaIntegrity": 95.0, "audioSpoken": true, "sourceMode": "Live Webcam", "notes": "", "bookmarked": false, "createdAt": "2020-01-01T00:00:00Z", "updatedAt": "2020-01-01T00:00:00Z" }
   }
   ```
10. **Payload 10 — Unauthorized Blanket List Query (`scanLogs` list without `where('ownerId', '==', uid)`)**:
    ```json
    {
      "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
      "path": "/scanLogs",
      "operation": "list_unfiltered"
    }
    ```
11. **Payload 11 — Out-of-Bounds Metric Injection (`dailyProgress/{progressId}` update with `avgConfidence: 250`)**:
    ```json
    {
      "auth": { "uid": "user_1", "token": { "email_verified": true } },
      "path": "/dailyProgress/user_1_Mon",
      "operation": "update",
      "data": { "avgConfidence": 250, "updatedAt": "SERVER_TIMESTAMP" }
    }
    ```
12. **Payload 12 — Cross-User Delete (`dailyProgress/{progressId}` delete by non-owner)**:
    ```json
    {
      "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
      "path": "/dailyProgress/user_1_Mon",
      "operation": "delete"
    }
    ```
