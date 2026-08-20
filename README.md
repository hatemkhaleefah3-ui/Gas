# DAFATI / Campusly

A course-scoped study platform rebuilt from the supplied functional implementation contract.

## What is implemented

- Cloudflare Worker runtime with static SPA fallback
- D1 as canonical structured data source
- KV profile-photo storage only
- secure scrypt password storage and hashed session tokens
- Student and Manager authorization
- active-course scoping
- bilingual English/Arabic client state
- all 25 canonical application routes
- responsive dashboard, learning, schedule, community, study-room, opportunity, course, notification, profile/settings and manager interfaces
- persistent APIs for the primary end-to-end study flows
- notification preference gates and scheduled study reminders
- D1 schema split across nine ordered migrations
- contract/security/validation tests

## Local setup

1. Install dependencies: `npm install`
2. Create a D1 database and replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.jsonc`.
3. Create a KV namespace and replace `REPLACE_WITH_KV_NAMESPACE_ID`.
4. Apply migrations in order with Wrangler.
5. Run `npm test` and `npm run dev`.

The client uses regular browser history routes; Wrangler static assets are configured with SPA fallback so direct URL refreshes continue to work.

## Architecture

`public/` contains the deployed SPA. `worker/` owns authentication, authorization, validation, course context, API routing and scheduled jobs. `migrations/` owns the canonical D1 schema. Structured application records never use KV as authority.

## Deployment note

Resource IDs in `wrangler.jsonc` are intentionally placeholders because D1/KV resources must be created in the destination Cloudflare account before deployment. No production secret or resource identifier is committed to the repository.
