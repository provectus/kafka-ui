import styled from 'styled-components';
import { Colors } from 'theme/theme';

interface Props {
  className: string;
  position: 'left' | 'right';
  inputSize: 'M' | 'L';
}

const StyledIcon = styled.i<Props>`
  position: absolute;
  top: 50%;
  transform: translate3d(0, -60%, 0);
  z-index: 1;
  left: ${(props) => (props.position === 'left' ? '12px' : '97%')};
  height: 11px;
  width: 11px;
  color: ${Colors.neutral[70]};
`;

export default StyledIcon;
