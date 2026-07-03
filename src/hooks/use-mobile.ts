import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Returns whether the viewport is below the mobile breakpoint.
 *
 * IMPORTANT: must initialize to a deterministic `false` (NOT `undefined`)
 * so that SSR and the first client render produce identical output.
 * An `undefined` initial value causes Radix's Sidebar to take a different
 * internal branch during SSR vs hydration, which shifts every downstream
 * `useId()` output and triggers a React 19 hydration mismatch.
 * The real value is resolved in the effect after mount.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
