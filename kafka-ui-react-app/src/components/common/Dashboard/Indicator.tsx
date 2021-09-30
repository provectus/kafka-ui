import React from 'react';
import { styled } from 'lib/themedStyles';

interface Props {
  fetching?: boolean;
  label: React.ReactNode;
  title?: string;
  className?: string;
}

const Indicator: React.FC<Props> = ({
  label,
  title,
  fetching,
  className,
  children,
}) => {
  return (
    <div className={className}>
      <div title={title}>
        <p className="is-size-8">{label}</p>
        {fetching ? (
          <span className="icon has-text-grey-light">
            <i className="fas fa-spinner fa-pulse" />
          </span>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default styled(Indicator)`
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
`;
