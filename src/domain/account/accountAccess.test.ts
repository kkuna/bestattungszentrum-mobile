import type { AuthenticatedSession } from "@/services/session"

import {
  canAccessRouteGroup,
  getAccountStatusDisplay,
  getRouteAccessDecision,
  getWorkspacePathForSession,
  isBusinessRouteBlocked,
  normalizeAccountAccess,
} from "./accountAccess"

const baseSession: AuthenticatedSession = {
  isAuthenticated: true,
  accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
  refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
  userId: "user-1",
  email: "owner@example.com",
  role: "FUNERAL_HOME_USER",
  tenantId: "tenant-1",
  accountStatus: "ACTIVE",
  userStatus: "ACTIVE",
  languagePreference: "de",
}

describe("account access decisions", () => {
  it("routes active funeral-home users to the funeral-home workspace only", () => {
    expect(normalizeAccountAccess(baseSession)).toEqual({
      status: "active",
      roleGroup: "funeralHome",
      workspacePath: "/funeral-home",
      routeAllowed: true,
    })
    expect(getWorkspacePathForSession(baseSession)).toBe("/funeral-home")
    expect(canAccessRouteGroup(baseSession, "funeralHome")).toBe(true)
    expect(canAccessRouteGroup(baseSession, "supplier")).toBe(false)
  })

  it("routes active supplier users to the supplier workspace only", () => {
    const session = { ...baseSession, role: "SUPPLIER_USER" } as const

    expect(getWorkspacePathForSession(session)).toBe("/supplier")
    expect(canAccessRouteGroup(session, "supplier")).toBe(true)
    expect(canAccessRouteGroup(session, "funeralHome")).toBe(false)
  })

  it.each([
    ["PENDING_APPROVAL", "pendingApproval"],
    ["PENDING_REVIEW", "pendingReview"],
    ["SUSPENDED", "suspended"],
    ["CLOSED", "closed"],
  ] as const)("blocks %s accounts with display metadata", (accountStatus, expectedStatus) => {
    const session = { ...baseSession, accountStatus }

    expect(isBusinessRouteBlocked(session)).toBe(true)
    expect(normalizeAccountAccess(session)).toMatchObject({
      status: expectedStatus,
      roleGroup: "funeralHome",
      routeAllowed: false,
      workspacePath: "/account-status",
    })
    expect(getAccountStatusDisplay(expectedStatus)).toMatchObject({
      labelTx: `accountStatus:statuses.${expectedStatus}.label`,
      accessibilityLabelTx: `accountStatus:statuses.${expectedStatus}.accessibilityLabel`,
    })
  })

  it("blocks failed funeral-home verification from the backend verification status field", () => {
    const session = { ...baseSession, verificationStatus: "FAILED" } as const

    expect(isBusinessRouteBlocked(session)).toBe(true)
    expect(normalizeAccountAccess(session)).toMatchObject({
      status: "verificationFailed",
      roleGroup: "funeralHome",
      routeAllowed: false,
      workspacePath: "/account-status",
    })
    expect(getAccountStatusDisplay("verificationFailed")).toMatchObject({
      labelTx: "accountStatus:statuses.verificationFailed.label",
      accessibilityLabelTx: "accountStatus:statuses.verificationFailed.accessibilityLabel",
    })
  })

  it("fails closed for back-office roles without defaulting to funeral-home", () => {
    const session = { ...baseSession, role: "ADMIN", tenantId: null } as const

    expect(getWorkspacePathForSession(session)).toBe("/account-status")
    expect(canAccessRouteGroup(session, "funeralHome")).toBe(false)
    expect(normalizeAccountAccess(session)).toMatchObject({
      status: "wrongRole",
      routeAllowed: false,
    })
  })

  it("fails closed for missing tenant, missing account status, suspended user, and provider unavailable", () => {
    expect(normalizeAccountAccess({ ...baseSession, tenantId: "" })).toMatchObject({
      status: "unknown",
      routeAllowed: false,
    })
    expect(normalizeAccountAccess({ ...baseSession, accountStatus: undefined })).toMatchObject({
      status: "unknown",
      routeAllowed: false,
    })
    expect(normalizeAccountAccess({ ...baseSession, userStatus: "SUSPENDED" })).toMatchObject({
      status: "suspended",
      routeAllowed: false,
    })
    expect(normalizeAccountAccess(null)).toMatchObject({
      status: "providerUnavailable",
      routeAllowed: false,
    })
  })

  it("returns redirect decisions before protected route content can render", () => {
    expect(getRouteAccessDecision(baseSession, "funeralHome")).toEqual({
      allowed: true,
      redirectPath: null,
    })
    expect(getRouteAccessDecision(baseSession, "supplier")).toEqual({
      allowed: false,
      redirectPath: "/funeral-home",
    })
    expect(
      getRouteAccessDecision({ ...baseSession, accountStatus: "PENDING_REVIEW" }, "funeralHome"),
    ).toEqual({
      allowed: false,
      redirectPath: "/account-status",
    })
  })
})
