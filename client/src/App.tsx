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
import Menu from './components/menu'
import { MenuContextProvider } from './context/MenuContext'

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

const SERVER_ADDRESSES = process.env.REACT_APP_SERVER_ADDRESSES
  ? process.env.REACT_APP_SERVER_ADDRESSES.split(',')
  : ['localhost:3333']

const App = () => (
  <HelmetProvider>
    <Helmet>
      <meta name="theme-color" content={colors.background} />
    </Helmet>

    <GlobalStyles />

    <SocketContextProvider serverAddresses={SERVER_ADDRESSES}>
      <AppContainer>
        <BrowserRouter>
          <MenuContextProvider>
            <Menu />
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
            </Switch>
          </MenuContextProvider>
        </BrowserRouter>
      </AppContainer>
    </SocketContextProvider>
  </HelmetProvider>
)

export default App
