const de = {
  common: {
    ok: "OK",
    cancel: "Abbrechen",
    back: "Zurück",
  },
  welcomeScreen: {
    postscript:
      "Diese Starter-Ansicht gehört nicht mehr zum mobilen Bestattungszentrum-Arbeitsbereich.",
    readyForLaunch: "Bestattungszentrum-Arbeitsbereich wird vorbereitet",
    exciting: "Platzhalter für die Routenstruktur",
  },
  errorScreen: {
    title: "Etwas ist schiefgelaufen.",
    friendlySubtitle:
      "Im mobilen Arbeitsbereich ist ein unerwarteter Fehler aufgetreten. Bitte setzen Sie die App zurück und versuchen Sie es erneut.",
    reset: "App zurücksetzen",
  },
  emptyStateComponent: {
    generic: {
      heading: "Keine Daten vorhanden",
      content: "Es wurden noch keine Daten gefunden. Bitte aktualisieren Sie die Ansicht.",
      button: "Erneut versuchen",
    },
  },
  api: {
    error: {
      network: "Der Dienst ist derzeit nicht erreichbar.",
      timeout: "Der Dienst hat nicht rechtzeitig geantwortet.",
      server: "Beim Dienst ist ein Fehler aufgetreten.",
      auth: "Bitte melden Sie sich erneut an.",
      accessDenied: "Sie haben keinen Zugriff auf diese Anfrage.",
      notFound: "Der angeforderte Datensatz wurde nicht gefunden.",
      validation: "Bitte prüfen Sie die übermittelten Angaben.",
      badData: "Der Dienst hat eine unerwartete Antwort geliefert.",
      cancelled: "Die Anfrage wurde abgebrochen.",
      unknown: "Die Anfrage konnte nicht abgeschlossen werden.",
    },
  },
  auth: {
    entry: {
      eyebrow: "Bestattungszentrum",
      title: "Zugang zum Arbeitsbereich",
      body: "Melden Sie sich an, beantragen Sie Zugang für Ihr Bestattungsinstitut oder prüfen Sie rechtliche Informationen, während der mobile Arbeitsbereich vorbereitet wird.",
      loginAction: "Anmelden",
      signupAction: "Bestatter-Zugang",
      forgotPasswordAction: "Passwort vergessen",
      legalAction: "Rechtliche Informationen",
    },
    login: {
      eyebrow: "Sicherer Zugang",
      title: "Anmelden",
      body: "Die Anmeldung verbindet verifizierte Bestattungsinstitute und Lieferanten mit ihrem jeweiligen Arbeitsbereich.",
      status: "Die Authentifizierung wird in den Session-Foundation-Stories umgesetzt.",
      primaryAction: "Anmeldung nicht verfügbar",
    },
    signup: {
      eyebrow: "Bestattungsinstitute",
      title: "Zugang beantragen",
      body: "Das geführte Onboarding für Bestattungsinstitute erfasst Unternehmens- und Kontaktdaten in einer späteren Story.",
      status: "Die Registrierung bleibt ein Platzhalter, bis der Antragsprozess umgesetzt ist.",
      primaryAction: "Registrierung nicht verfügbar",
    },
    forgotPassword: {
      eyebrow: "Kontounterstützung",
      pendingTitle: "Passwort-Hilfe ausstehend",
      pendingMessage:
        "Die Passwort-Wiederherstellung ist in der mobilen App nicht verfügbar, bis der Backend-Endpunkt bestätigt ist.",
      status: "Nutzen Sie bis zur Umsetzung den bestehenden Support-Prozess für Kontozugriff.",
      primaryAction: "Wiederherstellung nicht verfügbar",
    },
  },
  funeralHome: {
    shell: {
      eyebrow: "Arbeitsbereich Bestattungsinstitut",
      title: "Anfragen und Lieferanten",
      body: "Dieser Bereich wird Kategoriesuche, Lieferantensuche, RFQ-Erstellung und ausgehende Anfragehistorie enthalten.",
      status: "Rollenprüfung und Arbeitsbereich-Tabs folgen nach den Session-Foundation-Stories.",
    },
  },
  supplier: {
    shell: {
      eyebrow: "Arbeitsbereich Lieferant",
      title: "Eingehende Anfragen",
      body: "Dieser Bereich wird Anfrageeingang, Anfragedetails, Angebotsantworten und Katalog-Platzhalter enthalten.",
      status:
        "Lieferantenzugang ist nur für verifizierte Lieferantenkonten vorgesehen, die über freigegebene Betriebsprozesse erstellt werden.",
    },
  },
  shared: {
    legal: {
      eyebrow: "Rechtliches",
      status: "Finale Rechtstexte werden angebunden, sobald freigegebene Dokumente vorliegen.",
      impressum: {
        title: "Impressum",
        body: "Unternehmensangaben, verantwortliche Kontakte und erforderliche Veröffentlichungsdaten werden hier angezeigt.",
      },
      privacy: {
        title: "Datenschutzhinweis",
        body: "Informationen zum Datenschutz fuer Kontozugang und RFQ-Abläufe werden hier angezeigt.",
      },
      terms: {
        title: "Nutzungsbedingungen",
        body: "Arbeitsbereich-Bedingungen für verifizierte Organisationen werden hier angezeigt.",
      },
    },
  },
}

export default de
