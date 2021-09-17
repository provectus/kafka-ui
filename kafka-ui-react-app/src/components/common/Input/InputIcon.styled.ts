import styled from 'styled-components';
import { Colors } from 'theme/theme';

interface Props {
  className: string;
  position: 'left' | 'right';
  inputSize: 'M' | 'L';
}

const StyledIcon = styled.i<Props>`
  position: absolute;
  top: ${(props) => (props.inputSize === 'M' ? '8px' : '12px')};
  left: ${(props) => (props.position === 'left' ? '12px' : '97%')};
  height: 11px;
  width: 11px;
  color: ${Colors.neutral[70]};
`;

export default StyledIcon;
