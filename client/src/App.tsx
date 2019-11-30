import 'sanitize.css'
import 'sanitize.css/forms.css'
import 'sanitize.css/typography.css'

import React, { useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { colors } from './utils/colors'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import DeviceView from './views/DeviceView/DeviceView'
import MainMenu from './components/mainMenu/MainMenu'
import LandingView from './views/LandingView'
import config from './config'
import useServerStore from './stores/useServerStore'

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }

  body {
    overscroll-behavior: contain;
    background-color: ${colors.background};
    font-family: 'Exo 2', sans-serif;
  }
`

const App = () => {
  const init = useServerStore(store => store.init)
  useEffect(() => init(config.serverAddresses), [init])

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="theme-color" content={colors.background} />
      </Helmet>

      <GlobalStyles />

      <AppContainer>
        <BrowserRouter>
          <MainMenu />
          <Switch>
            <Route
              path="/:server/:device"
              render={({ match }) => (
                <DeviceView
                  serverId={decodeURIComponent(match.params.server)}
                  deviceId={decodeURIComponent(match.params.device)}
                />
              )}
            />

            <Route component={LandingView}></Route>
          </Switch>
        </BrowserRouter>
      </AppContainer>
    </HelmetProvider>
  )
}

export default App
