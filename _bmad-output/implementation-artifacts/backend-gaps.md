# Backend/API Contract Gaps

This file tracks backend/API contract gaps surfaced during BMAD implementation, review, or Argent verification. Keep historical entries even after resolution so future stories can see why mobile workarounds exist.

## Resolved

- **Mobile auth status fields omitted from `/api/mobile/auth/login` and `/api/mobile/auth/me`**
  - Source: Epic 1 retrospective; Stories 1.6, 1.7, 2.1, 2.2 verification notes.
  - Impact: Real active sessions failed closed to unknown status, so active workspace verification required temporary active-session fixtures.
  - Resolution evidence: On 2026-05-25, live local `/api/mobile/auth/me` returned `accountStatus`, `verificationStatus`, and `userStatus` for `dev-funeral-home-token`.
  - Follow-up: Keep mobile fail-closed behavior for missing or malformed status fields.

- **Mobile supplier detail endpoint missing for supplier IDs returned by search**
  - Source: Story 2.3 code review and Argent verification.
  - Impact: `suppliersApi.getSupplier()` called `GET /api/mobile/suppliers/:supplierId`, but the local backend returned not-found, so active supplier detail could not be verified against the real backend.
  - Resolution: Added backend `GET /api/mobile/suppliers/[id]`, service coverage, OpenAPI path, and Argent verification of active supplier detail on 2026-05-25.
  - Follow-up: Keep detail route aligned with the active-supplier search visibility rule.

- **Local backend unavailable for Story 2.5 protected RFQ runtime verification**
  - Source: Story 2.5 Argent verification on 2026-05-26.
  - Impact: The running iOS app initially loaded the updated JS bundle, but the protected funeral-home RFQ flow could not be exercised because session hydration stayed on the recoverable offline state (`Sitzung kann nicht geprüft werden`) and direct RFQ deep links remained blocked by the route gate.
  - Resolution: Started sibling backend `bestattungszentrum-app` with `npm run dev` on port `3000`; Argent session retry cleared the route gate and opened the RFQ form with seeded active supplier/category data.
  - Follow-up: Keep the backend running for manual/Argent mobile verification when exercising protected flows.

- **Create quote request deadline format differed between mobile contract and local backend**
  - Source: Story 2.5 Argent verification and code review on 2026-05-26 against local `bestattungszentrum-app`.
  - Impact: The initial mobile implementation converted the UI date from `YYYY-MM-DD` to an ISO datetime with offset, while the running backend route validates `deadline` as a date-only string and returned HTTP 422 for the mobile payload.
  - Resolution: Mobile now treats the backend date-only format as the source of truth for `POST /api/mobile/quote-requests`; the RFQ form strict-validates calendar dates, `createQuoteRequestInputSchema.deadline` accepts only `YYYY-MM-DD`, and Argent verified a live successful receipt after `POST /api/mobile/quote-requests` returned 200 on 2026-05-26.
  - Follow-up: Keep create-quote-request documentation and future generated clients aligned on date-only `deadline` unless the backend contract changes.

## Open

- **OpenAPI documents supplier search as `query`, implementation consumes `q`**
  - Source: Stories 1.3 and 2.2.
  - Impact: Mobile must map app-level `query` to backend `q` inside `suppliersApi`; generated clients would drift unless the contract is corrected.
  - Current workaround: `suppliersApi.listSuppliers()` owns the `query` to `q` mapping.
  - Needed backend action: Align OpenAPI and implementation on one parameter name.

- **No certification search filter parameter**
  - Source: Story 2.2.
  - Impact: Supplier cards can display certifications, but mobile cannot offer a real certification filter without inventing unsupported backend behavior.
  - Current workaround: Discover renders certification-filter pending copy instead of an active filter.
  - Needed backend action: Add and document a certification filter parameter, or confirm certification filtering is out of scope.

- **No dedicated public supplier verification/requestability field**
  - Source: Stories 2.2 and 2.3.
  - Impact: Mobile can safely derive requestability from `accountStatus === "ACTIVE"`, but cannot claim a supplier is verified beyond available public data.
  - Current workaround: UI shows conservative requestability/status copy and avoids unsupported verification claims.
  - Needed backend action: Expose a documented public supplier verification/requestability field if product requires that distinction.

- **Supplier mobile DTO exposes fields that may be internal**
  - Source: Story 2.3.
  - Impact: `billingEmail` and `subscriptionTier` are present in mobile supplier responses even though the detail screen must not show them to funeral-home users.
  - Current workaround: Mobile validates the DTO but does not render internal fields.
  - Needed backend action: Confirm these fields are intentionally public to authenticated funeral-home users, or return a dedicated public supplier DTO.

- **RFQ `quoteFormSchema` shape is not documented**
  - Source: Story 2.4.
  - Impact: The dynamic RFQ renderer must defensively normalize arbitrary JSON-like schema data and avoid exposing raw backend field names.
  - Current workaround: Story 2.4 added an app-owned schema normalizer that supports common field/property shapes, maps unsupported fields to localized fallback descriptors, and blocks malformed root schemas without crashing.
  - Verification limit: Mobile tests cover fixtures for supported, empty, unsupported, incomplete, and malformed shapes, but live backend coverage remains limited until the schema contract is documented.
  - Needed backend action: Document the supported schema shape, field types, labels, validation constraints, and localization strategy.

- **Attachment upload contract is unconfirmed for RFQ creation**
  - Source: Story 2.4.
  - Impact: The RFQ form cannot implement real attachments without risking an incompatible upload flow.
  - Current workaround: Story 2.4 renders disabled/explanatory attachment placeholders only and does not add upload behavior.
  - Verification limit: Runtime/UI can verify the placeholder state only; upload behavior is intentionally not exercised.
  - Needed backend action: Confirm upload endpoint, asset ownership, MIME/size rules, and quote-request attachment payload shape.

- **Top-level RFQ quantity is not present in create-quote-request DTO**
  - Source: Story 2.4.
  - Impact: Planning mentions quantity, but `CreateQuoteRequestInputDto` requires `attributes` and has no top-level `quantity`.
  - Current workaround: Stories 2.4 and 2.5 capture optional quantity in the universal form area and submit it as `attributes.quantity`.
  - Verification limit: Mobile tests verify attribute shaping and Story 2.5 verified live create success, but the backend contract still does not document whether quantity should remain an attribute or become first-class.
  - Needed backend action: Confirm whether quantity belongs in `attributes` or should become a first-class request field.

- **Create quote request response does not expose email dispatch status**
  - Source: Story 2.5 story-context analysis and implementation.
  - Impact: Story 2.5 receipts must explain whether supplier email dispatch is queued, sent, failed, or unavailable. Mobile accepts optional `quoteRequestSchema.emailDispatch`, but the running backend create response omitted dispatch metadata.
  - Current workaround: Story 2.5 renders dispatch as unavailable/unknown when the create response omits dispatch metadata, while the API schema accepts a documented `emailDispatch` extension if the backend starts returning it.
  - Verification limit: Mobile tests cover unavailable dispatch receipt copy and mocked queued/sent/failed DTO mapping, but cannot verify real queued/sent/failed dispatch until the backend exposes it.
  - Needed backend action: Include documented email-dispatch metadata in quote-request create/detail responses, or document the endpoint the mobile app should call for dispatch state.

- **No confirmed mobile request-detail endpoint**
  - Source: Story 2.6 create-story refresh.
  - Impact: Outgoing request detail must not assume `GET /api/mobile/requests` returns full detail unless the backend contract says so.
  - Current workaround: Story 2.6 should add a typed API method only after confirming list/detail response shape.
  - Needed backend action: Document or add a request-detail endpoint and response schema.

- **Quote-request PDF/document-link contract is unconfirmed**
  - Source: Story 2.6 create-story refresh; Story 2.6 code review; PRD endpoint inventory lists `GET /api/mobile/quote-requests/:id/pdf`, but no mobile API method or response shape exists in source.
  - Impact: Request detail cannot safely expose a PDF/document action without knowing whether the backend returns a direct URL, binary PDF, signed URL, or document asset reference.
  - Current workaround: Story 2.6 hides app-relative and storage-key document URLs in the mobile UI and only opens absolute HTTP(S) document URLs, treating those as externally openable/signed links. Malformed, protocol-relative, or relative API URLs stay behind the unavailable placeholder.
  - Verification limit: Argent iOS verification on 2026-05-26 confirmed the seeded request exposes `/api/mobile/quote-requests/quote-1/pdf` as a relative document URL. Follow-up review curl checks showed unauthenticated browser access to that URL returns `403 application/json`, while app-authenticated access with `dev-funeral-home-token` returns `200 application/pdf`; therefore external browser opening is intentionally disabled until an authenticated download/open flow or signed URL contract exists.
  - Needed backend action: Document the quote-request PDF/document endpoint, authorization behavior, response content type/shape, expiry rules for signed links, and failure statuses in the backend/OpenAPI contract, or return signed public document URLs in `documents[]`.

- **Timeline informational state is not represented in the current DTO**
  - Source: Story 2.6 create-story refresh; UX asks for completed, pending, failed, and informational timeline states.
  - Impact: `requestTimelineEventSchema.status` currently allows only `DONE`, `PENDING`, and `FAILED`, so the app must not invent an unsupported `INFO` backend status.
  - Current workaround: Story 2.6 renders the confirmed `DONE`, `PENDING`, and `FAILED` states with localized semantic badges and accepts the backend's `SYSTEM` timeline actor source without broadening authenticated user roles. Informational remains unmodeled until the backend adds or documents it.
  - Verification limit: Argent iOS verification on 2026-05-26 confirmed list/detail timeline events include `REQUEST_CREATED`, `REQUEST_SENT`, `REQUEST_EMAIL_QUEUED`, and `AUDIT`; the mobile UI localizes the confirmed event labels it knows and falls back only for unknown future event types.
  - Needed backend action: Confirm whether informational timeline items are modeled by event type, a new event status, or another field.
