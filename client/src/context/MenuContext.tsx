import React from 'react'

interface MenuContextValue {
  isMenuOpen: boolean
  setMenuOpen: (
    isMenuOpen: boolean | ((isMenuOpen: boolean) => boolean)
  ) => void
}

const MenuContext = React.createContext<MenuContextValue | null>(null)

export const MenuContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isMenuOpen, setMenuOpen] = React.useState(true)

  const value = React.useMemo(
    () => ({
      isMenuOpen,
      setMenuOpen
    }),
    [isMenuOpen]
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
