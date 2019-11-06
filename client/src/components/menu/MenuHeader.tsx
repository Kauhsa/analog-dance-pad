import styled from 'styled-components'

import { largeText } from '../Typography'
import scale from '../../utils/scale'

const MenuHeader = styled.h1`
  ${largeText};
  margin: ${scale(2)} ${scale(2)} 0 ${scale(2)};
`

export default MenuHeader
