import React from 'react'

interface MenuContextValue {
  isMenuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
}

const MenuContext = React.createContext<MenuContextValue | null>(null)

export const MenuContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(true)
  const openMenu = React.useCallback(() => setIsMenuOpen(true), [])
  const closeMenu = React.useCallback(() => setIsMenuOpen(false), [])

  const value = React.useMemo(
    () => ({
      isMenuOpen,
      openMenu,
      closeMenu
    }),
    [closeMenu, isMenuOpen, openMenu]
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export const useMenuContext = () => {
  const context = React.useContext(MenuContext)

  if (!context) {
    throw new Error('Not inside MenuContextProvider')
  }

  return context
}
