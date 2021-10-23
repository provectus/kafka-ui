import React from 'react';
import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

interface Props {
  fetching?: boolean;
  isAlert?: boolean;
  label: React.ReactNode;
  title?: string;
}

const IndicatorWrapperStyled = styled.div`
  background-color: white;
  height: 68px;
  width: 100%;
  max-width: 170px;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 12px 16px;
  flex-grow: 1;

  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.08);
  margin: 0 0 3px 0;

  & .indicator-label {
    font-weight: 500;
    font-size: 12px;
    color: ${Colors.neutral[50]};
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const Indicator: React.FC<Props> = ({
  label,
  title,
  fetching,
  isAlert,
  children,
}) => {
  return (
    <IndicatorWrapperStyled>
      <div title={title}>
        <div className="indicator-label">
          {label}{' '}
          {isAlert && (
            <svg
              width="4"
              height="4"
              viewBox="0 0 4 4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="2" cy="2" r="2" fill="#E61A1A" />
            </svg>
          )}
        </div>
        {fetching ? <i className="fas fa-spinner fa-pulse" /> : children}
      </div>
    </IndicatorWrapperStyled>
  );
};

export default Indicator;
