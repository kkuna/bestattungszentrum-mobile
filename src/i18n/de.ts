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
      body: "Melden Sie sich mit Ihrem verifizierten Arbeitsbereich-Konto an.",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "name@unternehmen.de",
      passwordLabel: "Passwort",
      passwordPlaceholder: "Passwort eingeben",
      missingFields: "Bitte geben Sie E-Mail-Adresse und Passwort ein.",
      success: "Sie sind angemeldet.",
      status: "Ihre Sitzung wird sicher auf diesem Gerät gespeichert.",
      primaryAction: "Anmelden",
      submitting: "Anmeldung läuft ...",
    },
    session: {
      eyebrow: "Sitzung",
      bootTitle: "Sitzung wird geprüft",
      bootBody:
        "Der mobile Arbeitsbereich prüft Ihre gespeicherte Anmeldung, bevor geschützte Bereiche angezeigt werden.",
      bootStatus: "Bitte warten Sie einen Moment.",
      offlineTitle: "Sitzung kann nicht geprüft werden",
      offlineBody:
        "Der Dienst ist derzeit nicht erreichbar. Ihre gespeicherte Anmeldung bleibt geschützt und kann erneut geprüft werden.",
      offlineStatus: "Versuchen Sie es erneut, sobald die Verbindung wieder verfügbar ist.",
      retryAction: "Erneut prüfen",
      signOutAction: "Lokal abmelden",
      logoutAction: "Abmelden",
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
    tabs: {
      home: "Start",
      discover: "Entdecken",
      quotes: "Anfragen",
    },
    tabAccessibility: {
      home: "Bestattungsinstitut Start öffnen",
      discover: "Lieferanten entdecken öffnen",
      quotes: "Anfragen öffnen",
    },
    shell: {
      eyebrow: "Arbeitsbereich Bestattungsinstitut",
      title: "Arbeitsbereich Übersicht",
      body: "Hier entsteht die Übersicht für Kategorien, Lieferanten und ausgehende Anfragen.",
      status:
        "Ihre Rolle und Ihr Kontostatus werden geprüft, bevor dieser Arbeitsbereich angezeigt wird.",
    },
    home: {
      eyebrow: "Arbeitsbereich Bestattungsinstitut",
      title: "Startübersicht",
      body: "Wählen Sie eine Kategorie, prüfen Sie vorbereitete Anfragebereiche oder fahren Sie mit der Lieferantensuche fort.",
      status: "Aktive Konten sehen hier geschützte Arbeitsbereich-Daten.",
      categories: {
        title: "Kategorien",
        body: "Starten Sie die Lieferantensuche über passende Leistungsbereiche.",
        loading: "Kategorien werden geladen ...",
        loadingTileA11y: "Kategoriekachel wird geladen",
        unnamedCategory: "Kategorie",
        emptyTitle: "Noch keine Kategorien verfügbar",
        emptyBody:
          "Der Dienst liefert derzeit keine aktiven Kategorien. Sie können den Entdecken-Bereich öffnen und später erneut prüfen.",
        emptyAction: "Entdecken öffnen",
        errorTitle: "Kategorien konnten nicht geladen werden",
        retryAction: "Erneut versuchen",
        retryingAction: "Wird geprüft ...",
        tileA11y: "Kategorie {{name}} öffnen",
      },
      shortcuts: {
        title: "Anfragen",
        body: "Kurze Wege zu den nächsten Arbeitsbereichen, bis Anfrageverlauf und Details umgesetzt sind.",
        discoverTitle: "Lieferanten entdecken",
        discoverBody: "Öffnet den vorbereiteten Bereich für kategoriebasierte Lieferantensuche.",
        discoverAction: "Entdecken",
        quotesTitle: "Anfragen prüfen",
        quotesBody: "Öffnet den vorbereiteten Bereich für ausgehende Anfragen und Antworten.",
        quotesAction: "Anfragen",
      },
    },
    discover: {
      search: {
        eyebrow: "Lieferanten",
        title: "Lieferanten finden",
        body: "Suchen Sie nach verifizierbaren Partnern und grenzen Sie die Ergebnisse nach Leistungsbereich, Region und Sprache ein.",
        placeholder: "Name, Ort oder Leistung suchen",
        inputAccessibilityLabel: "Lieferantensuche",
        selectedLabel: "Suche",
        clearQueryAction: "Suche löschen",
        resultCountLabel: "Treffer",
        resultCountAccessibilityLabel: "Suchergebnisanzahl",
      },
      filters: {
        title: "Filter",
        body: "Alle Filter sind reversibel und können einzeln oder gesammelt entfernt werden.",
        categoryTitle: "Leistungsbereich",
        regionTitle: "Region",
        languageTitle: "Sprache",
        certificationPendingTitle: "Zertifizierungsfilter ausstehend",
        certificationPendingBody:
          "Zertifizierungen werden auf Karten angezeigt. Ein Suchfilter wird erst aktiviert, wenn der Dienst diesen Parameter unterstützt.",
        clearCategoryAction: "Kategorie entfernen",
        clearRegionAction: "Region entfernen",
        clearLanguageAction: "Sprache entfernen",
        clearAllAction: "Alle Filter löschen",
        languages: {
          german: "Deutsch",
          english: "Englisch",
        },
      },
      card: {
        categoryFallback: "Leistungsbereich nicht zugeordnet",
        regionsLabel: "Regionen",
        languagesLabel: "Sprachen",
        certificationsLabel: "Zertifizierungen",
        detailAction: "Details ansehen",
        detailA11y: "Details zu {{name}} öffnen",
        requestAction: "Angebot anfragen",
        requestUnavailableAction: "Anfrage nicht verfügbar",
        status: {
          requestable: "Anfragbar",
          requestableA11y: "Lieferantenstatus: anfragbar",
          unavailable: "Nicht anfragbar",
          unavailableA11y: "Lieferantenstatus: nicht anfragbar",
        },
      },
      states: {
        loadingCard: "Lieferant wird geladen ...",
        loadingCardA11y: "Lieferantenkarte wird geladen",
        emptyTitle: "Keine passenden Lieferanten gefunden",
        emptyBody:
          "Löschen Sie Filter, prüfen Sie andere Kategorien oder passen Sie Region und Sprache an.",
        emptyClearAction: "Filter löschen",
        emptyBrowseAction: "Kategorien prüfen",
        errorTitle: "Lieferanten konnten nicht geladen werden",
        retryAction: "Erneut versuchen",
        retryingAction: "Wird geprüft ...",
      },
      detail: {
        loadingTitle: "Lieferant wird geladen",
        loadingBody: "Die Detaildaten werden sicher abgerufen.",
        notFoundTitle: "Lieferant nicht gefunden",
        notFoundBody: "Dieser Lieferant ist nicht verfügbar oder der Link ist nicht mehr gültig.",
        errorTitle: "Lieferant konnte nicht geladen werden",
        retryAction: "Erneut versuchen",
        retryingAction: "Wird geprüft ...",
        backToDiscoverAction: "Zur Suche zurück",
        requestAction: "Angebot anfragen",
        requestBlockedAction: "Anfrage blockiert",
        requestA11y: "Angebot für diesen Lieferanten anfragen",
        blockedSupplierTitle: "Anfrage für diesen Lieferanten nicht möglich",
        blockedSupplierBody:
          "Der Lieferant ist derzeit nicht aktiv oder nicht verfügbar. Prüfen Sie einen anderen Lieferanten.",
        blockedAccountTitle: "Ihr Konto kann keine Anfrage starten",
        blockedAccountBody:
          "Ihr Kontostatus erlaubt derzeit keine neue Anfrage. Sie können die Lieferantendaten weiterhin prüfen.",
        legalNameLabel: "Rechtlicher Name",
        addressLabel: "Adresse",
        categoriesLabel: "Leistungsbereiche",
        categoryFallback: "Leistungsbereich nicht zugeordnet",
        regionsLabel: "Regionen",
        regionsFallback: "Keine Regionen angegeben",
        languagesLabel: "Sprachen",
        languagesFallback: "Keine Sprachen angegeben",
        certificationsLabel: "Zertifizierungen",
        certificationsFallback: "Keine Zertifizierungen angegeben",
        descriptionFallback: "Noch keine öffentliche Beschreibung hinterlegt.",
        phoneLabel: "Telefon",
        phoneFallback: "Keine Telefonnummer veröffentlicht",
        emailLabel: "E-Mail",
        sections: {
          trust: "Status und Stammdaten",
          coverage: "Abdeckung",
          description: "Beschreibung",
          contact: "Öffentliche Kontaktdaten",
        },
        accountStatus: {
          PENDING_REVIEW: "In Prüfung",
          PENDING_APPROVAL: "Freigabe ausstehend",
          ACTIVE: "Aktiv",
          SUSPENDED: "Gesperrt",
          CLOSED: "Deaktiviert",
        },
      },
    },
    quotes: {
      eyebrow: "Anfragen",
      title: "Anfragebereich vorbereitet",
      body: "Ausgehende Anfragen und Antworten werden hier in einer späteren Story zusammengeführt.",
      status: "Es werden noch keine geschäftlichen Anfrage-Aktionen angeboten.",
      newTitle: "Anfrage vorbereitet",
      newBody:
        "Der Lieferanten- und Leistungskontext wurde übernommen. Das Anfrageformular wird in der nächsten Story freigeschaltet.",
      newStatus:
        "Bis dahin bleibt diese Ansicht ein kontrollierter Platzhalter ohne Versand oder Bestellung.",
    },
    profile: {
      eyebrow: "Profil",
      title: "Organisationsprofil",
      body: "Stammdaten und Kontaktinformationen für Ihr Bestattungsinstitut werden hier vorbereitet.",
      status: "Profiländerungen sind in diesem Platzhalter noch nicht verfügbar.",
    },
    settings: {
      title: "Einstellungen",
      body: "Verwalten Sie Sprache, Sitzung, Hinweise und rechtliche Informationen für Ihr Konto.",
    },
  },
  supplier: {
    tabs: {
      home: "Start",
      requests: "Anfragen",
      catalog: "Katalog",
    },
    tabAccessibility: {
      home: "Lieferant Start öffnen",
      requests: "Eingehende Anfragen öffnen",
      catalog: "Katalog öffnen",
    },
    shell: {
      eyebrow: "Arbeitsbereich Lieferant",
      title: "Arbeitsbereich Übersicht",
      body: "Hier entsteht die Übersicht für eingehende Anfragen, Antworten und Kataloginformationen.",
      status:
        "Ihre Lieferantenrolle und Ihr Kontostatus werden geprüft, bevor dieser Arbeitsbereich angezeigt wird.",
    },
    requests: {
      eyebrow: "Anfragen",
      title: "Eingang vorbereitet",
      body: "Eingehende Anfragen und Detailansichten werden hier angezeigt, sobald der Anfragefluss umgesetzt ist.",
      status: "Dieser Bereich enthält keine Bestattungsinstitut-Suche oder RFQ-Erstellung.",
    },
    catalog: {
      eyebrow: "Katalog",
      title: "Katalog vorbereitet",
      body: "Leistungsinformationen und Katalogdaten werden hier in einer späteren Story gepflegt.",
      status: "Katalogbearbeitung ist in diesem Platzhalter noch nicht verfügbar.",
    },
    profile: {
      eyebrow: "Profil",
      title: "Lieferantenprofil",
      body: "Organisations- und Kontaktdaten für Ihren Lieferanten-Arbeitsbereich werden hier vorbereitet.",
      status: "Profiländerungen sind in diesem Platzhalter noch nicht verfügbar.",
    },
    settings: {
      title: "Einstellungen",
      body: "Verwalten Sie Sprache, Sitzung, Hinweise und rechtliche Informationen für Ihr Konto.",
    },
  },
  accountStatus: {
    eyebrow: "Kontozugang",
    title: "Kontostatus",
    sections: {
      explanation: "Bedeutung",
      restrictions: "Aktuelle Einschränkungen",
      nextStep: "Nächster Schritt",
    },
    contactAction: "Support kontaktieren",
    statuses: {
      active: {
        label: "Aktiv",
        accessibilityLabel: "Kontostatus: aktiv",
        explanation: "Ihre Organisation ist für diesen Arbeitsbereich verifiziert.",
        restrictions: "Geschäftliche Routen sind für Ihre zugewiesene Rolle verfügbar.",
        nextStep: "Fahren Sie in Ihrem Arbeitsbereich fort.",
      },
      pendingApproval: {
        label: "Freigabe ausstehend",
        accessibilityLabel: "Kontostatus: Freigabe ausstehend",
        explanation: "Ihre Organisation wurde erfasst und wartet auf Freigabe.",
        restrictions:
          "Geschäftliche Formulare und Arbeitsbereich-Aktionen bleiben bis zur Freigabe gesperrt.",
        nextStep:
          "Warten Sie auf die Freigabe-Nachricht oder kontaktieren Sie den Support, wenn sich der Status nicht ändert.",
      },
      pendingReview: {
        label: "Prüfung läuft",
        accessibilityLabel: "Kontostatus: Prüfung läuft",
        explanation:
          "Ihre Organisation wird geprüft, bevor der Arbeitsbereich freigeschaltet wird.",
        restrictions: "Geschützte geschäftliche Routen sind während der Prüfung gesperrt.",
        nextStep:
          "Prüfen Sie Ihre E-Mails auf Aktualisierungen oder Anforderungen zu fehlenden Angaben.",
      },
      suspended: {
        label: "Gesperrt",
        accessibilityLabel: "Kontostatus: gesperrt",
        explanation: "Der Arbeitsbereich-Zugang für diese Organisation ist vorübergehend gesperrt.",
        restrictions: "Geschäftliche Routen und Formularübermittlung sind gesperrt.",
        nextStep:
          "Kontaktieren Sie den Support, um zu klären, was für die Reaktivierung erforderlich ist.",
      },
      verificationFailed: {
        label: "Verifizierung fehlgeschlagen",
        accessibilityLabel: "Kontostatus: Verifizierung fehlgeschlagen",
        explanation: "Die übermittelten Organisationsdaten konnten nicht verifiziert werden.",
        restrictions:
          "Geschäftliche Routen bleiben gesperrt, bis das Verifizierungsproblem gelöst ist.",
        nextStep:
          "Prüfen Sie die Hinweise des Supports und bereiten Sie korrigierte Organisationsdaten vor.",
      },
      providerUnavailable: {
        label: "Status nicht verfügbar",
        accessibilityLabel: "Kontostatus: Anbieter nicht verfügbar",
        explanation: "Der Dienst konnte den aktuellen Kontostatus nicht bestätigen.",
        restrictions: "Geschützte Routen bleiben gesperrt, bis der Status bestätigt werden kann.",
        nextStep:
          "Versuchen Sie es später erneut oder melden Sie sich ab und wieder an, wenn der Dienst verfügbar ist.",
      },
      closed: {
        label: "Geschlossen",
        accessibilityLabel: "Kontostatus: geschlossen",
        explanation: "Dieses Organisationskonto ist geschlossen.",
        restrictions: "Arbeitsbereich-Routen und geschäftliche Aktionen sind nicht verfügbar.",
        nextStep: "Kontaktieren Sie den Support, wenn Sie diesen Status für falsch halten.",
      },
      unknown: {
        label: "Status unbekannt",
        accessibilityLabel: "Kontostatus: unbekannt",
        explanation: "Die App kann den Kontostatus für diese Sitzung nicht sicher bestimmen.",
        restrictions: "Geschützte Routen sind gesperrt, um Arbeitsbereich-Daten zu schützen.",
        nextStep:
          "Melden Sie sich ab und wieder an oder kontaktieren Sie den Support, falls das Problem bestehen bleibt.",
      },
      wrongRole: {
        label: "Zugang nicht verfügbar",
        accessibilityLabel: "Kontostatus: Rolle nicht erlaubt",
        explanation:
          "Dieses Konto ist keinem mobilen Bestattungsinstitut- oder Lieferanten-Arbeitsbereich zugewiesen.",
        restrictions: "Rollenspezifische geschäftliche Routen bleiben nicht verfügbar.",
        nextStep:
          "Nutzen Sie das richtige Konto oder kontaktieren Sie den Support, falls Ihre Rolle falsch ist.",
      },
    },
  },
  shared: {
    tabs: {
      profile: "Profil",
      settings: "Einstellungen",
    },
    tabAccessibility: {
      profile: "Profil öffnen",
      settings: "Einstellungen öffnen",
    },
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
    settings: {
      eyebrow: "Konto",
      rows: {
        language: {
          label: "Sprache",
          description: "Deutsch oder Englisch für Navigation und Platzhalter auswählen.",
          accessibilityLabel: "Spracheinstellungen öffnen",
        },
        sessionSecurity: {
          label: "Sitzung und Sicherheit",
          description: "Aktive Sitzung prüfen und sicher abmelden.",
          accessibilityLabel: "Sitzung und Sicherheit öffnen",
        },
        notifications: {
          label: "Hinweise",
          description: "Platzhalter für Benachrichtigungen und Präferenzen.",
          accessibilityLabel: "Hinweise und Präferenzen öffnen",
        },
        offline: {
          label: "Offline und erneut versuchen",
          description: "Platzhalter für Verbindungsstatus und Wiederholung.",
          accessibilityLabel: "Offline und erneut versuchen öffnen",
        },
        empty: {
          label: "Leerer Zustand",
          description: "Platzhalter für Ansichten ohne verfügbare Daten.",
          accessibilityLabel: "Leeren Zustand öffnen",
        },
        error: {
          label: "Fehlerzustand",
          description: "Platzhalter für wiederherstellbare Fehler.",
          accessibilityLabel: "Fehlerzustand öffnen",
        },
        impressum: {
          label: "Impressum",
          description: "Rechtliche Anbieterangaben anzeigen.",
          accessibilityLabel: "Impressum öffnen",
        },
        privacy: {
          label: "Datenschutzhinweis",
          description: "Informationen zum Datenschutz anzeigen.",
          accessibilityLabel: "Datenschutzhinweis öffnen",
        },
        terms: {
          label: "Nutzungsbedingungen",
          description: "Bedingungen für den Arbeitsbereich anzeigen.",
          accessibilityLabel: "Nutzungsbedingungen öffnen",
        },
      },
      language: {
        eyebrow: "Sprache",
        title: "App-Sprache",
        body: "Die Auswahl wird in Ihrer Sitzung gespeichert und aktualisiert Navigation und Platzhalter.",
        german: "Deutsch",
        english: "Englisch",
        germanAccessibilityLabel: "Deutsch als App-Sprache auswählen",
        englishAccessibilityLabel: "Englisch als App-Sprache auswählen",
        backAccessibilityLabel: "Zurück zu den Einstellungen",
        success: "Sprache wurde gespeichert.",
      },
      sessionSecurity: {
        eyebrow: "Sicherheit",
        title: "Sitzung verwalten",
        body: "Melden Sie sich ab, wenn dieses Gerät nicht mehr für den Arbeitsbereich genutzt werden soll.",
        status: "Die Abmeldung nutzt die bestehende sichere Sitzungsverwaltung.",
      },
      placeholders: {
        notifications: {
          eyebrow: "Hinweise",
          title: "Präferenzen vorbereitet",
          body: "Benachrichtigungen und Arbeitsbereich-Hinweise werden hier später verwaltet.",
          status: "Es werden noch keine Hinweise auf diesem Gerät konfiguriert.",
        },
        offline: {
          eyebrow: "Verbindung",
          title: "Offline-Zustand vorbereitet",
          body: "Diese Ansicht zeigt später, wie Verbindungsprobleme sicher erneut versucht werden können.",
          status: "Der Wiederholungsbutton ist in diesem Platzhalter deaktiviert.",
          retryAction: "Erneut versuchen",
        },
        empty: {
          eyebrow: "Leerer Zustand",
          title: "Keine Daten vorhanden",
          body: "Dieser Platzhalter zeigt, wie leere Arbeitsbereich-Ansichten erklärt werden.",
          status: "Es werden keine geschäftlichen Daten geladen.",
        },
        error: {
          eyebrow: "Fehler",
          title: "Wiederherstellbarer Fehler",
          body: "Dieser Platzhalter zeigt, wie ein sicherer Fehlerzustand mit erneuter Prüfung aussieht.",
          status: "Der Wiederholungsbutton ist in diesem Platzhalter deaktiviert.",
          retryAction: "Erneut prüfen",
        },
      },
    },
  },
}

export default de
