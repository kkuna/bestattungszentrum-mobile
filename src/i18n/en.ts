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
      body: "Account login will connect verified funeral homes and suppliers to their role-specific workspace.",
      status: "Authentication is scheduled for the session foundation stories.",
      primaryAction: "Sign in unavailable",
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
    shell: {
      eyebrow: "Funeral-home workspace",
      title: "Requests and suppliers",
      body: "This area will host category discovery, supplier search, RFQ creation, and outgoing request history.",
      status: "Role gates and workspace tabs arrive after the session foundation stories.",
    },
  },
  supplier: {
    shell: {
      eyebrow: "Supplier workspace",
      title: "Incoming requests",
      body: "This area will host request inbox, request details, quote responses, and catalog placeholders.",
      status:
        "Supplier access is only for verified supplier accounts created through approved operations channels.",
    },
  },
  shared: {
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
  },
}

export default en
export type Translations = typeof en
