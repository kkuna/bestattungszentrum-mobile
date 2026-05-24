const en = {
  common: {
    ok: "OK",
    cancel: "Cancel",
    back: "Back",
  },
  welcomeScreen: {
    postscript: "This starter screen is no longer part of the Bestattungszentrum mobile workspace.",
    readyForLaunch: "Bestattungszentrum workspace preparation",
    exciting: "Route shell placeholder",
  },
  errorScreen: {
    title: "Something went wrong.",
    friendlySubtitle:
      "The mobile workspace hit an unexpected error. Please reset the app and try again.",
    reset: "Reset app",
  },
  emptyStateComponent: {
    generic: {
      heading: "No records available",
      content: "No matching workspace data is available yet. Refresh the view to try again.",
      button: "Try again",
    },
  },
  api: {
    error: {
      network: "The service is currently unreachable.",
      timeout: "The service did not respond in time.",
      server: "The service encountered an error.",
      auth: "Please sign in again.",
      accessDenied: "You do not have access to this request.",
      notFound: "The requested record was not found.",
      validation: "Please check the submitted information.",
      badData: "The service returned an unexpected response.",
      cancelled: "The request was cancelled.",
      unknown: "The request could not be completed.",
    },
  },
  auth: {
    entry: {
      eyebrow: "Bestattungszentrum",
      title: "Workspace access",
      body: "Sign in to continue, request funeral-home access, or review legal information while the mobile workspace is being prepared.",
      loginAction: "Sign in",
      signupAction: "Funeral-home signup",
      forgotPasswordAction: "Forgot password",
      legalAction: "Legal information",
    },
    login: {
      eyebrow: "Secure access",
      title: "Sign in",
      body: "Sign in with your verified workspace account.",
      emailLabel: "Email address",
      emailPlaceholder: "name@company.de",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      missingFields: "Enter both email address and password.",
      success: "You are signed in.",
      status: "Your session is stored securely on this device.",
      primaryAction: "Sign in",
      submitting: "Signing in ...",
    },
    session: {
      eyebrow: "Session",
      bootTitle: "Checking session",
      bootBody:
        "The mobile workspace is validating your saved sign-in before protected areas are shown.",
      bootStatus: "Please wait a moment.",
      offlineTitle: "Session cannot be checked",
      offlineBody:
        "The service is currently unreachable. Your saved sign-in remains protected and can be checked again.",
      offlineStatus: "Try again when the connection is available.",
      retryAction: "Check again",
      signOutAction: "Sign out locally",
      logoutAction: "Sign out",
    },
    signup: {
      eyebrow: "Funeral homes",
      title: "Request access",
      body: "The guided funeral-home onboarding form will collect company and contact details in a later story.",
      status: "Signup is a placeholder until the application submission flow is implemented.",
      primaryAction: "Signup unavailable",
    },
    forgotPassword: {
      eyebrow: "Account support",
      pendingTitle: "Password recovery pending",
      pendingMessage:
        "Password recovery is not available in the mobile app until the backend endpoint is confirmed.",
      status:
        "Use the existing support process for account access until this feature is implemented.",
      primaryAction: "Recovery unavailable",
    },
  },
  funeralHome: {
    tabs: {
      home: "Home",
      discover: "Discover",
      quotes: "Quotes",
    },
    tabAccessibility: {
      home: "Open funeral-home home",
      discover: "Open supplier discovery",
      quotes: "Open quotes",
    },
    shell: {
      eyebrow: "Funeral-home workspace",
      title: "Workspace overview",
      body: "This area is preparing categories, suppliers, and outgoing request history.",
      status: "Your role and account status are checked before this workspace is shown.",
    },
    discover: {
      eyebrow: "Suppliers",
      title: "Discovery pending",
      body: "Categories and matching service providers will appear here when search is implemented.",
      status: "This area is a placeholder with no request actions.",
    },
    quotes: {
      eyebrow: "Requests",
      title: "Request area pending",
      body: "Outgoing requests and responses will be collected here in a later story.",
      status: "No business request actions are available yet.",
    },
    profile: {
      eyebrow: "Profile",
      title: "Organization profile",
      body: "Master data and contact information for your funeral home will be prepared here.",
      status: "Profile changes are not available in this placeholder.",
    },
    settings: {
      title: "Settings",
      body: "Manage language, session, notices, and legal information for your account.",
    },
  },
  supplier: {
    tabs: {
      home: "Home",
      requests: "Requests",
      catalog: "Catalog",
    },
    tabAccessibility: {
      home: "Open supplier home",
      requests: "Open incoming requests",
      catalog: "Open catalog",
    },
    shell: {
      eyebrow: "Supplier workspace",
      title: "Workspace overview",
      body: "This area is preparing incoming requests, responses, and catalog information.",
      status: "Your supplier role and account status are checked before this workspace is shown.",
    },
    requests: {
      eyebrow: "Requests",
      title: "Inbox pending",
      body: "Incoming requests and detail views will appear here when the request flow is implemented.",
      status: "This area does not expose funeral-home discovery or RFQ creation.",
    },
    catalog: {
      eyebrow: "Catalog",
      title: "Catalog pending",
      body: "Service information and catalog data will be managed here in a later story.",
      status: "Catalog editing is not available in this placeholder.",
    },
    profile: {
      eyebrow: "Profile",
      title: "Supplier profile",
      body: "Organization and contact details for your supplier workspace will be prepared here.",
      status: "Profile changes are not available in this placeholder.",
    },
    settings: {
      title: "Settings",
      body: "Manage language, session, notices, and legal information for your account.",
    },
  },
  accountStatus: {
    eyebrow: "Account access",
    title: "Account status",
    sections: {
      explanation: "What this means",
      restrictions: "Current restrictions",
      nextStep: "Next step",
    },
    contactAction: "Contact support",
    statuses: {
      active: {
        label: "Active",
        accessibilityLabel: "Account status: active",
        explanation: "Your organization is verified for this workspace.",
        restrictions: "Business routes are available for your assigned role.",
        nextStep: "Continue in your workspace.",
      },
      pendingApproval: {
        label: "Pending approval",
        accessibilityLabel: "Account status: pending approval",
        explanation: "Your organization has been received and is waiting for approval.",
        restrictions:
          "Business forms and workspace actions stay unavailable until approval is complete.",
        nextStep: "Wait for the approval notice or contact support if the status does not change.",
      },
      pendingReview: {
        label: "Pending review",
        accessibilityLabel: "Account status: pending review",
        explanation: "Your organization is being reviewed before workspace access is opened.",
        restrictions: "Protected business routes are blocked during review.",
        nextStep: "Check your email for review updates or missing information requests.",
      },
      suspended: {
        label: "Suspended",
        accessibilityLabel: "Account status: suspended",
        explanation: "Workspace access for this organization is temporarily suspended.",
        restrictions: "Business routes and form submission are blocked.",
        nextStep: "Contact support to understand what is needed before access can resume.",
      },
      verificationFailed: {
        label: "Verification failed",
        accessibilityLabel: "Account status: verification failed",
        explanation: "The submitted organization information could not be verified.",
        restrictions: "Business routes remain blocked until the verification issue is resolved.",
        nextStep: "Review support instructions and prepare corrected organization details.",
      },
      providerUnavailable: {
        label: "Status unavailable",
        accessibilityLabel: "Account status: provider unavailable",
        explanation: "The service could not confirm the current account status.",
        restrictions: "Protected routes stay blocked until the status can be confirmed.",
        nextStep: "Try again later or sign out and sign in again when service access is available.",
      },
      closed: {
        label: "Closed",
        accessibilityLabel: "Account status: closed",
        explanation: "This organization account is closed.",
        restrictions: "Workspace routes and business actions are unavailable.",
        nextStep: "Contact support if you believe this status is incorrect.",
      },
      unknown: {
        label: "Status unknown",
        accessibilityLabel: "Account status: unknown",
        explanation: "The app cannot safely determine the account status for this session.",
        restrictions: "Protected routes are blocked to protect workspace data.",
        nextStep: "Sign out and sign in again, or contact support if the issue continues.",
      },
      wrongRole: {
        label: "Access not available",
        accessibilityLabel: "Account status: role not allowed",
        explanation: "This account is not assigned to a mobile funeral-home or supplier workspace.",
        restrictions: "Role-specific business routes remain unavailable.",
        nextStep: "Use the correct account or contact support if your role is wrong.",
      },
    },
  },
  shared: {
    tabs: {
      profile: "Profile",
      settings: "Settings",
    },
    tabAccessibility: {
      profile: "Open profile",
      settings: "Open settings",
    },
    legal: {
      eyebrow: "Legal",
      status: "Final legal copy will be connected when approved documents are available.",
      impressum: {
        title: "Impressum",
        body: "Company identification, responsible contacts, and required publication details will appear here.",
      },
      privacy: {
        title: "Privacy notice",
        body: "Data protection information for account access and RFQ workflows will appear here.",
      },
      terms: {
        title: "Terms of use",
        body: "Workspace terms for verified organizations will appear here.",
      },
    },
    settings: {
      eyebrow: "Account",
      rows: {
        language: {
          label: "Language",
          description: "Choose German or English for navigation and placeholders.",
          accessibilityLabel: "Open language settings",
        },
        sessionSecurity: {
          label: "Session and security",
          description: "Review the active session and sign out securely.",
          accessibilityLabel: "Open session and security",
        },
        notifications: {
          label: "Notices",
          description: "Placeholder for notifications and preferences.",
          accessibilityLabel: "Open notices and preferences",
        },
        offline: {
          label: "Offline and retry",
          description: "Placeholder for connection status and retry behavior.",
          accessibilityLabel: "Open offline and retry",
        },
        empty: {
          label: "Empty state",
          description: "Placeholder for views without available data.",
          accessibilityLabel: "Open empty state",
        },
        error: {
          label: "Error state",
          description: "Placeholder for recoverable errors.",
          accessibilityLabel: "Open error state",
        },
        impressum: {
          label: "Impressum",
          description: "Show legal provider information.",
          accessibilityLabel: "Open impressum",
        },
        privacy: {
          label: "Privacy notice",
          description: "Show data protection information.",
          accessibilityLabel: "Open privacy notice",
        },
        terms: {
          label: "Terms of use",
          description: "Show workspace terms.",
          accessibilityLabel: "Open terms of use",
        },
      },
      language: {
        eyebrow: "Language",
        title: "App language",
        body: "Your selection is stored with the session and refreshes navigation and placeholders.",
        german: "German",
        english: "English",
        germanAccessibilityLabel: "Select German as app language",
        englishAccessibilityLabel: "Select English as app language",
        success: "Language has been saved.",
      },
      sessionSecurity: {
        eyebrow: "Security",
        title: "Manage session",
        body: "Sign out when this device should no longer access the workspace.",
        status: "Sign-out uses the existing secure session handling.",
      },
      placeholders: {
        notifications: {
          eyebrow: "Notices",
          title: "Preferences pending",
          body: "Notifications and workspace notices will be managed here later.",
          status: "No notices are configured on this device yet.",
        },
        offline: {
          eyebrow: "Connection",
          title: "Offline state pending",
          body: "This view will later show how connection issues can be retried safely.",
          status: "The retry button is disabled in this placeholder.",
          retryAction: "Try again",
        },
        empty: {
          eyebrow: "Empty state",
          title: "No data available",
          body: "This placeholder shows how empty workspace views are explained.",
          status: "No business data is loaded.",
        },
        error: {
          eyebrow: "Error",
          title: "Recoverable error",
          body: "This placeholder shows a safe error state with retry guidance.",
          status: "The retry button is disabled in this placeholder.",
          retryAction: "Check again",
        },
      },
    },
  },
}

export default en
export type Translations = typeof en
