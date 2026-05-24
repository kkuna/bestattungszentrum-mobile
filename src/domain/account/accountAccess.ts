import type { TxKeyPath } from "@/i18n"
import type {
  AccountStatusDto,
  UserRoleDto,
  UserStatusDto,
  VerificationStatusDto,
} from "@/services/api/types"
import type { AuthenticatedSession } from "@/services/session/types"

export type RouteGroup = "funeralHome" | "supplier"
export type WorkspacePath = "/funeral-home" | "/supplier"
export type AccountStatusRoutePath = "/account-status"

export type AccountAccessStatus =
  | "active"
  | "pendingApproval"
  | "pendingReview"
  | "suspended"
  | "verificationFailed"
  | "providerUnavailable"
  | "closed"
  | "unknown"
  | "wrongRole"

export type StatusTone = "neutral" | "info" | "warning" | "critical"

export type AccountAccessDecision = {
  status: AccountAccessStatus
  roleGroup: RouteGroup | null
  workspacePath: WorkspacePath | AccountStatusRoutePath
  routeAllowed: boolean
}

export type RouteAccessDecision = {
  allowed: boolean
  redirectPath: WorkspacePath | AccountStatusRoutePath | "/" | null
}

export type AccountStatusDisplay = {
  status: AccountAccessStatus
  tone: StatusTone
  labelTx: TxKeyPath
  accessibilityLabelTx: TxKeyPath
  explanationTx: TxKeyPath
  restrictionsTx: TxKeyPath
  nextStepTx: TxKeyPath
  contactActionTx?: TxKeyPath
}

const ACCOUNT_STATUS_PATH: AccountStatusRoutePath = "/account-status"

const roleGroups: Record<
  Extract<UserRoleDto, "FUNERAL_HOME_USER" | "SUPPLIER_USER">,
  RouteGroup
> = {
  FUNERAL_HOME_USER: "funeralHome",
  SUPPLIER_USER: "supplier",
}

const workspacePaths: Record<RouteGroup, WorkspacePath> = {
  funeralHome: "/funeral-home",
  supplier: "/supplier",
}

const accountStatusMap: Record<AccountStatusDto, AccountAccessStatus> = {
  ACTIVE: "active",
  CLOSED: "closed",
  PENDING_APPROVAL: "pendingApproval",
  PENDING_REVIEW: "pendingReview",
  SUSPENDED: "suspended",
}

const userStatusMap: Record<UserStatusDto, Exclude<AccountAccessStatus, "active"> | null> = {
  ACTIVE: null,
  PENDING: "pendingApproval",
  SUSPENDED: "suspended",
}

const verificationStatusMap: Record<
  VerificationStatusDto,
  Exclude<AccountAccessStatus, "active"> | null
> = {
  FAILED: "verificationFailed",
  STALE: "providerUnavailable",
  UNVERIFIED: "pendingReview",
  VERIFIED: null,
}

const statusTones: Record<AccountAccessStatus, StatusTone> = {
  active: "info",
  closed: "neutral",
  pendingApproval: "warning",
  pendingReview: "warning",
  providerUnavailable: "warning",
  suspended: "critical",
  unknown: "critical",
  verificationFailed: "critical",
  wrongRole: "critical",
}

function statusTx(status: AccountAccessStatus, leaf: string): TxKeyPath {
  return `accountStatus:statuses.${status}.${leaf}` as TxKeyPath
}

export function getRoleGroupForSession(
  session: Pick<AuthenticatedSession, "role">,
): RouteGroup | null {
  if (session.role === "FUNERAL_HOME_USER" || session.role === "SUPPLIER_USER") {
    return roleGroups[session.role]
  }

  return null
}

export function normalizeAccountAccess(
  session: AuthenticatedSession | null | undefined,
): AccountAccessDecision {
  if (!session) {
    return closedDecision("providerUnavailable", null)
  }

  const roleGroup = getRoleGroupForSession(session)
  if (!roleGroup) {
    return closedDecision("wrongRole", null)
  }

  if (!session.tenantId) {
    return closedDecision("unknown", roleGroup)
  }

  const verificationStatus = session.verificationStatus
    ? verificationStatusMap[session.verificationStatus]
    : null
  if (verificationStatus) {
    return closedDecision(verificationStatus, roleGroup)
  }

  const userStatus = session.userStatus ? userStatusMap[session.userStatus] : null
  if (userStatus) {
    return closedDecision(userStatus, roleGroup)
  }

  if (!session.accountStatus) {
    return closedDecision("unknown", roleGroup)
  }

  const accountStatus = accountStatusMap[session.accountStatus] ?? "unknown"
  if (accountStatus !== "active") {
    return closedDecision(accountStatus, roleGroup)
  }

  return {
    status: "active",
    roleGroup,
    workspacePath: workspacePaths[roleGroup],
    routeAllowed: true,
  }
}

export function getWorkspacePathForSession(
  session: AuthenticatedSession,
): WorkspacePath | AccountStatusRoutePath {
  return normalizeAccountAccess(session).workspacePath
}

export function canAccessRouteGroup(
  session: AuthenticatedSession,
  routeGroup: RouteGroup,
): boolean {
  const decision = normalizeAccountAccess(session)

  return decision.routeAllowed && decision.roleGroup === routeGroup
}

export function isBusinessRouteBlocked(session: AuthenticatedSession | null | undefined): boolean {
  return !normalizeAccountAccess(session).routeAllowed
}

export function getRouteAccessDecision(
  session: AuthenticatedSession,
  routeGroup: RouteGroup,
): RouteAccessDecision {
  const decision = normalizeAccountAccess(session)

  if (decision.routeAllowed && decision.roleGroup === routeGroup) {
    return { allowed: true, redirectPath: null }
  }

  return { allowed: false, redirectPath: decision.workspacePath }
}

export function getAccountStatusDisplay(status: AccountAccessStatus): AccountStatusDisplay {
  return {
    status,
    tone: statusTones[status],
    labelTx: statusTx(status, "label"),
    accessibilityLabelTx: statusTx(status, "accessibilityLabel"),
    explanationTx: statusTx(status, "explanation"),
    restrictionsTx: statusTx(status, "restrictions"),
    nextStepTx: statusTx(status, "nextStep"),
    contactActionTx: status === "active" ? undefined : "accountStatus:contactAction",
  }
}

function closedDecision(
  status: Exclude<AccountAccessStatus, "active">,
  roleGroup: RouteGroup | null,
): AccountAccessDecision {
  return {
    status,
    roleGroup,
    workspacePath: ACCOUNT_STATUS_PATH,
    routeAllowed: false,
  }
}
