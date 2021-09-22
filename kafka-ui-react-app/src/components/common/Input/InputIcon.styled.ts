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
  line-height: 0;
  z-index: 1;
  left: ${(props) => (props.position === 'left' ? '12px' : 'unset')};
  right: ${(props) => (props.position === 'right' ? '15px' : 'unset')};
  height: 11px;
  width: 11px;
  color: ${Colors.neutral[70]};
`;

export default StyledIcon;
