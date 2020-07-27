import React from 'react';

export enum CustomParamButtonType {
  plus = 'fa-plus',
  minus = 'fa-minus',
  chevronRight = 'fa-chevron-right',
}

interface Props {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className: string;
  type: CustomParamButtonType;
  btnText?: string;
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
