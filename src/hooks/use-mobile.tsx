import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkIsMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
      const isAndroid = /android/i.test(ua)

      setIsMobile(
        isIOS ||
        isAndroid ||
        window.innerWidth < MOBILE_BREAKPOINT
      )
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkIsMobile)

    checkIsMobile()

    return () => mql.removeEventListener("change", checkIsMobile)
  }, [])

  return !!isMobile
}
