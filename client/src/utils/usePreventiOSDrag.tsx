import { useLayoutEffect, RefObject } from 'react'

const preventDefault = (e: Event) => e.preventDefault()

// Mobile safari overscroll is pretty persistent. ugly solution, but I
// couldn't find better one. We don't want to apply this globally because
// it prevents useful scroll effects as well, but rather surgically to where
// it's needed!
export const usePreventMobileSafariDrag = (ref: RefObject<HTMLElement>) => {
  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }

    const element = ref.current

    element.addEventListener('touchmove', preventDefault, {
      passive: false
    })

    return () => {
      element.removeEventListener('touchmove', preventDefault)
    }
  }, [ref])
}
