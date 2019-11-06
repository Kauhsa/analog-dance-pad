import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

import scale from '../utils/scale'
import TopBar from './topBar/TopBar'

interface Props {
  icon: IconProp
  children?: React.ReactNode
}

const Container = styled.div`
  display: flex;
  color: white;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  width: 100%;
  padding: ${scale(10)};
  flex-direction: column;
  opacity: 0.9;

  > svg {
    font-size: ${scale(10)};
    margin-bottom: ${scale(2)};
  }

  > div {
    font-size: ${scale(2)};
    max-width: ${scale(60)};
  }
`

const IconAndTextPage = React.memo<Props>(({ icon, children }) => (
  <>
    <TopBar />
    <Container>
      <FontAwesomeIcon icon={icon} />
      <div>{children}</div>
    </Container>
  </>
))

export default IconAndTextPage
