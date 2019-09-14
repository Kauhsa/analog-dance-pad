import 'sanitize.css'
import 'sanitize.css/forms.css'
import 'sanitize.css/typography.css'

import React from 'react'
import ButtonGroup from './components/SensorGroup'
import styled, { createGlobalStyle } from 'styled-components'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { ButtonType } from './domain/Button'
import { colors } from './utils/colors'

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

const BUTTONS: ButtonType[] = [
  {
    name: 'Button 1',
    pressed: false,
    sensors: [
      {
        id: 0,
        value: 0.1,
        threshold: 0.5
      },
      {
        id: 1,
        value: 0.3,
        threshold: 0.5
      },
      {
        id: 2,
        value: 0.5,
        threshold: 0.5
      }
    ]
  },
  {
    name: 'Button 2',
    pressed: true,
    sensors: [
      {
        id: 3,
        value: 0.1,
        threshold: 0.5
      },
      {
        id: 4,
        value: 0.6,
        threshold: 0.5
      }
    ]
  },
  {
    name: 'Button 3',
    pressed: true,
    sensors: [
      {
        id: 5,
        value: 0.4,
        threshold: 0.5
      },
      {
        id: 6,
        value: 0.8,
        threshold: 0.5
      }
    ]
  },
  {
    name: 'Button 4',
    pressed: true,
    sensors: [
      {
        id: 7,
        value: 0.2,
        threshold: 0.5
      },
      {
        id: 8,
        value: 0.6,
        threshold: 0.5
      }
    ]
  }
]

const App = () => (
  <HelmetProvider>
    <Helmet>
      <meta name="theme-color" content={colors.background} />
    </Helmet>

    <GlobalStyles />

    <AppContainer>
      <ButtonGroup buttons={BUTTONS} />
    </AppContainer>
  </HelmetProvider>
)

export default App
