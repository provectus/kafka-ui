import React from 'react';
import * as S from './CustomParams.styled'

interface Props {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className: string;
  type: 'fa-plus' | 'fa-minus' | 'fa-chevron-right';
  btnText?: string;
  disabled?: boolean;
}

const CustomParamButton: React.FC<Props> = ({
  onClick,
  className,
  type,
  btnText,
}) => (
  <button
    type="button"
    className={`button ${className} is-outlined`}
    onClick={onClick}
  >
    {btnText && <span>{btnText}</span>}
    <span className="icon">
      <i className={`fas fa-lg ${type}`} />
    </span>
  </button>
);

export default CustomParamButton;
