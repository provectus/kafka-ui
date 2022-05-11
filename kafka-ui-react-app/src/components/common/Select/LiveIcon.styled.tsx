import styled, { useTheme } from 'styled-components';
import React from 'react';

interface Props {
  className?: string;
}

const SVGWrapper = styled.i`
  display: flex;
`;

const LiveIcon: React.FC<Props> = () => {
  const theme = useTheme();
  return (
    <SVGWrapper>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="7" fill={theme.icons.liveIcon.circleBig} />
        <circle cx="8" cy="8" r="4" fill={theme.icons.liveIcon.circleSmall} />
      </svg>
    </SVGWrapper>
  );
};

export default styled(LiveIcon)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  line-height: 0;
`;
