# SkyClassroom — Wave 2 #115

SkyClassroom is a bounded classroom-membership domain core for SKYCOIN4444 education workflows. It preserves this repository's earlier learning experiments outside the supported product path while replacing fake-success package gates with a real isolated TypeScript build/test/audit boundary.

## Status

**Engineering beta / domain core.** This repository does not claim a production LMS, student identity verification, grading, attendance, video conferencing, payments, certificates, accreditation, durable storage, or deployment.

## Supported behavior

- validates classroom and SKYCOIN4444 subject identifiers;
- normalizes bounded classroom titles;
- creates the owner as an instructor;
- supports learner/instructor membership with idempotent same-role joins;
- prevents owner downgrade/removal;
- enforces bounded classroom capacity;
- returns defensive snapshots;
- exposes a stable integration contract with sorted member subject IDs.

## SKYCOIN4444 integration

`ClassroomIntegrationContract` exposes `{ classroomId, memberSubjectIds }`. Member IDs are intended to align with SkyIdentity's stable subject-ID boundary. Future course, assignment, gradebook and notification components can consume that contract without duplicating classroom membership rules.

## Verify

```bash
npm install
npm run verify
```

## Security and privacy boundary

All identifiers and titles are treated as untrusted inputs and bounded locally. State is process-local. This library does not authenticate users, authorize instructor actions, verify age/identity, protect educational records, encrypt data, or provide tenant isolation. Production use requires a durable store, authenticated/authorized service boundary, privacy controls, audit logging and deployment evidence.
