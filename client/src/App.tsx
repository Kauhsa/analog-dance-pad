import 'sanitize.css'
import 'sanitize.css/forms.css'
import 'sanitize.css/typography.css'

import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { colors } from './utils/colors'
import { SocketContextProvider } from './context/SocketContext'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import DeviceView from './views/DeviceView/DeviceView'
import { MenuContextProvider } from './context/MenuContext'
import MainMenu from './components/mainMenu/MainMenu'
import LandingView from './views/LandingView'
import config from './config'

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

const App = () => (
  <HelmetProvider>
    <Helmet>
      <meta name="theme-color" content={colors.background} />
    </Helmet>

    <GlobalStyles />

    <SocketContextProvider serverAddresses={config.serverAddresses}>
      <AppContainer>
        <BrowserRouter>
          <MenuContextProvider>
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
          </MenuContextProvider>
        </BrowserRouter>
      </AppContainer>
    </SocketContextProvider>
  </HelmetProvider>
)

export default App
