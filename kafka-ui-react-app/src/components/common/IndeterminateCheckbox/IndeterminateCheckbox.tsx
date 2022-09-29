import React, { HTMLProps } from 'react';
import styled from 'styled-components';

interface IndeterminateCheckboxProps extends HTMLProps<HTMLInputElement> {
  indeterminate?: boolean;
}

const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
  indeterminate,
  ...rest
}) => {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return <input type="checkbox" ref={ref} {...rest} />;
};

export default styled(IndeterminateCheckbox)`
  cursor: pointer;
`;
