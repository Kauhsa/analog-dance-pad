import React from 'react'
import { useMenuContext } from '../context/MenuContext'
import IconAndTextPage from '../components/IconAndTextPage'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
import TopBar from '../components/topBar/TopBar'

const LandingView = () => {
  const { openMenu } = useMenuContext()

  // open menu when rendering this page.
  React.useEffect(() => {
    openMenu()
  }, [openMenu])

  return (
    <>
      <TopBar />
      <IconAndTextPage icon={faArrowCircleLeft}>
        Select a device from left!
      </IconAndTextPage>
    </>
  )
}

export default LandingView
