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
  - Current workaround: Story 2.4 plans an app-owned schema normalizer with malformed-schema tests.
  - Needed backend action: Document the supported schema shape, field types, labels, validation constraints, and localization strategy.

- **Attachment upload contract is unconfirmed for RFQ creation**
  - Source: Story 2.4.
  - Impact: The RFQ form cannot implement real attachments without risking an incompatible upload flow.
  - Current workaround: Render attachment placeholders only.
  - Needed backend action: Confirm upload endpoint, asset ownership, MIME/size rules, and quote-request attachment payload shape.

- **Top-level RFQ quantity is not present in create-quote-request DTO**
  - Source: Story 2.4.
  - Impact: Planning mentions quantity, but `CreateQuoteRequestInputDto` requires `attributes` and has no top-level `quantity`.
  - Current workaround: Treat quantity as a category/universal field mapped into `attributes`.
  - Needed backend action: Confirm whether quantity belongs in `attributes` or should become a first-class request field.

- **No confirmed mobile request-detail endpoint**
  - Source: Story 2.6.
  - Impact: Outgoing request detail must not assume `GET /api/mobile/requests` returns full detail unless the backend contract says so.
  - Current workaround: Story 2.6 should add a typed API method only after confirming list/detail response shape.
  - Needed backend action: Document or add a request-detail endpoint and response schema.
