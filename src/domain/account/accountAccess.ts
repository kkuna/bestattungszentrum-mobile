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

// Blocking account statuses ordered most-restrictive first. When a session
// triggers more than one blocking status (e.g. a suspended account that also has
// a failed verification), the most restrictive applicable status wins, so the
// outcome does not depend on which field happens to be checked first.
const blockingStatusSeverity: Exclude<AccountAccessStatus, "active">[] = [
  "wrongRole",
  "suspended",
  "closed",
  "verificationFailed",
  "providerUnavailable",
  "unknown",
  "pendingReview",
  "pendingApproval",
]

// Resolve a single status field. An absent value adds no constraint; a present
// but unrecognized value fails closed to "unknown" rather than being silently
// skipped — a corrupt or legacy persisted value must never read as "allowed".
function resolveMappedStatus<Key extends string>(
  value: Key | null | undefined,
  map: Record<Key, Exclude<AccountAccessStatus, "active"> | null>,
): AccountAccessStatus | null {
  if (!value) {
    return null
  }

  if (!(value in map)) {
    return "unknown"
  }

  return map[value]
}

function pickMostRestrictive(
  statuses: AccountAccessStatus[],
): Exclude<AccountAccessStatus, "active"> {
  for (const candidate of blockingStatusSeverity) {
    if (statuses.includes(candidate)) {
      return candidate
    }
  }

  return "unknown"
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

  const blocking: AccountAccessStatus[] = []

  const verificationStatus = resolveMappedStatus(session.verificationStatus, verificationStatusMap)
  if (verificationStatus) {
    blocking.push(verificationStatus)
  }

  const userStatus = resolveMappedStatus(session.userStatus, userStatusMap)
  if (userStatus) {
    blocking.push(userStatus)
  }

  if (!session.accountStatus || !(session.accountStatus in accountStatusMap)) {
    blocking.push("unknown")
  } else {
    const accountStatus = accountStatusMap[session.accountStatus]
    if (accountStatus !== "active") {
      blocking.push(accountStatus)
    }
  }

  if (blocking.length > 0) {
    return closedDecision(pickMostRestrictive(blocking), roleGroup)
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
