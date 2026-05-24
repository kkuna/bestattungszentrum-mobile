import { fireEvent, render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import { ThemeProvider } from "@/theme/context"

import { AccountStatusPanel } from "./AccountStatusPanel"

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useScrollToTop: jest.fn(),
}))

jest.mock("react-native-keyboard-controller", () => {
  const { ScrollView } = require("react-native")

  return {
    KeyboardAwareScrollView: ScrollView,
  }
})

jest.mock("react-native-edge-to-edge", () => ({
  SystemBars: () => null,
}))

jest.mock("react-native-safe-area-context", () =>
  Object.assign({}, jest.requireActual("react-native-safe-area-context"), {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  }),
)

jest.mock("@/i18n/translate", () => ({
  translate: (key: string) => {
    const catalog = jest.requireActual("@/i18n/de").default
    const [namespace, path] = key.split(":")
    return path.split(".").reduce((value, segment) => value?.[segment], catalog[namespace]) ?? key
  },
}))

function renderPanel(element: React.ReactElement) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>{element}</ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("AccountStatusPanel", () => {
  it("renders localized status, explanation, restrictions, next step, and contact action", () => {
    const signOut = jest.fn()
    const panel = renderPanel(<AccountStatusPanel status="pendingReview" onSignOut={signOut} />)

    expect(panel.getByText(de.accountStatus.title)).toBeTruthy()
    expect(panel.getByText(de.accountStatus.statuses.pendingReview.label)).toBeTruthy()
    expect(panel.getByText(de.accountStatus.statuses.pendingReview.explanation)).toBeTruthy()
    expect(panel.getByText(de.accountStatus.statuses.pendingReview.restrictions)).toBeTruthy()
    expect(panel.getByText(de.accountStatus.statuses.pendingReview.nextStep)).toBeTruthy()
    expect(
      panel.getByLabelText(de.accountStatus.statuses.pendingReview.accessibilityLabel),
    ).toBeTruthy()

    expect(panel.getByText(de.accountStatus.contactAction)).toBeDisabled()
    fireEvent.press(panel.getByText(de.auth.session.logoutAction))
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it("does not communicate status by color alone", () => {
    const panel = renderPanel(<AccountStatusPanel status="suspended" />)

    expect(panel.getByText(de.accountStatus.statuses.suspended.label)).toBeTruthy()
    expect(panel.getByText(de.accountStatus.statuses.suspended.restrictions)).toBeTruthy()
    expect(panel.toJSON()).not.toContain("SUSPENDED")
  })
})
