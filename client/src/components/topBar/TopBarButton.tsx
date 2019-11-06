import styled from 'styled-components'
import IconButton from '../IconButton'
import scale from '../../utils/scale'

const TopBarButton = styled(IconButton).attrs({ size: scale(2.75) })`
  flex-shrink: 1;
  cursor: pointer;
  padding: ${scale(2)};
`

export default TopBarButton
