# Investigation: Mobile Login 500

## Hand-off Brief

1. **What happened.** Mobile login returns HTTP 500 after valid seeded credentials once an existing rate-limit bucket for the same subject has expired.
2. **Where the case stands.** Root cause is confirmed: the rate-limit service creates a second in-memory bucket for an expired `(scope, subject)`, then Prisma persistence fails on the database unique constraint for the same `(scope, subject)`.
3. **What's needed next.** Fix the backend rate-limit bucket lifecycle so expired buckets are replaced or reused before `replacePrismaRepository` persists the repository.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-05-24 |
| Status | Concluded |
| System | Local Next.js backend in `/Users/fariskunic/Documents/personal/bsc/bestattungszentrum-app`, Postgres on localhost:5435 |
| Evidence sources | Live HTTP response, live server stack trace, Postgres rows, backend source, Prisma schema |

## Problem Statement

User reported that seeded mobile login returned HTTP 500 during Android verification and asked to check the DB and seeds.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| Live endpoint | Available | `POST /api/mobile/auth/login` returned HTTP 500 for `einkauf@mueller-bestattungen.de` with valid seeded password. |
| Live server stack | Available | Temporary logging showed Prisma `P2002` on `RateLimitBucket(scope, subject)` during `replacePrismaRepository`. |
| Postgres state | Available | Existing expired `RateLimitBucket` rows were present for `mobile-auth-login` subjects. |
| Source code | Available | `assertRateLimit` only reuses non-expired buckets and pushes a new bucket for expired ones. |

## Confirmed Findings

### Finding 1: Seed user exists and password hash is present

**Evidence:** `src/server/seed.ts:31`, live DB query of `"User"` showed `einkauf@mueller-bestattungen.de`, role `FUNERAL_HOME_USER`, status `ACTIVE`, tenant `fh-1`, and seeded hash.

**Detail:** The 500 is not caused by missing seed user data or inactive account state.

### Finding 2: The live server fails on rate-limit bucket persistence

**Evidence:** Live server stack trace: `PrismaClientKnownRequestError`, `code: 'P2002'`, `target: [ 'scope', 'subject' ]`, thrown from `src/server/prisma-repository.ts:345`.

**Detail:** The failure happens during `tx.rateLimitBucket.createMany()` inside `replacePrismaRepository`, after credentials have passed far enough for the route to persist repository state.

### Finding 3: The schema forbids multiple buckets per scope and subject

**Evidence:** `prisma/schema.prisma:453` defines `RateLimitBucket`; `prisma/schema.prisma:462` declares `@@unique([scope, subject])`.

**Detail:** This allows only one row for `mobile-auth-login` plus a given IP/email subject across all windows.

### Finding 4: The rate limiter creates a new bucket when an old one is expired

**Evidence:** `src/server/rate-limit.ts:10` filters existing buckets by matching scope/subject and `resetAt > now`; `src/server/rate-limit.ts:23` pushes a new bucket when that filter misses.

**Detail:** Once the existing row expires, it remains in the repo, but no longer counts as reusable. The service then creates a second bucket with the same unique key.

## Deduced Conclusions

### Deduction 1: The 500 is a rate-limit lifecycle bug, not a seed bug

**Based on:** Findings 1-4.

**Reasoning:** Seeded user data validates, but persisting the mutated repo fails because expired rate-limit rows remain and the new current-window bucket duplicates `(scope, subject)`.

**Conclusion:** Resetting seeds or deleting rate-limit rows only temporarily hides the issue. It returns after the next rate-limit window expires.

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | `src/server/prisma-repository.ts:345`, `tx.rateLimitBucket.createMany()` |
| Trigger | `app/api/mobile/auth/login/route.ts:12` calls `assertRateLimit`, then `route.ts:19` persists repo state |
| Condition | Existing expired `RateLimitBucket` with same `scope` and `subject` remains in repo |
| Related files | `src/server/rate-limit.ts`, `prisma/schema.prisma`, `src/server/store.ts`, `src/server/prisma-repository.ts` |

## Conclusion

**Confidence:** High

The root cause is confirmed. `RateLimitBucket` has a permanent unique key on `(scope, subject)`, while `assertRateLimit` treats expired buckets as absent and appends a replacement without deleting or updating the expired bucket.

## Recommended Next Steps

### Fix direction

Update `assertRateLimit` to handle expired matching buckets by resetting the existing bucket in place instead of pushing a duplicate, or prune expired matching buckets before appending. A schema-level alternative is to include the window identity in the unique key, but the current repository model is simpler if it keeps one bucket per `(scope, subject)` and rolls it forward.

Applied follow-up fix: `src/server/rate-limit.ts` now reuses a matching expired bucket by resetting `count`, `createdAt`, `updatedAt`, and `resetAt` in place. `tests/production-hardening.test.ts` covers this regression by asserting an expired bucket does not create a duplicate.

### Diagnostic

After the fix, keep the existing expired `RateLimitBucket` rows in the dev DB and verify a valid mobile login returns 200. That proves the bug is fixed without relying on DB cleanup.

Verification completed: host `curl` to `/api/mobile/auth/login` returned HTTP 200 with the same existing DB rows, and Android Argent verification showed the app changing from localized server-error feedback to `Sie sind angemeldet.`

## Reproduction Plan

1. Ensure a `RateLimitBucket` exists with `scope = 'mobile-auth-login'`, a matching request subject, and `resetAt` in the past.
2. `POST /api/mobile/auth/login` with valid seeded credentials.
3. Current behavior: HTTP 500 with Prisma `P2002` on `(scope, subject)`.
4. Expected fixed behavior: HTTP 200 and the existing bucket is reset to count `1` with a new `resetAt`.
