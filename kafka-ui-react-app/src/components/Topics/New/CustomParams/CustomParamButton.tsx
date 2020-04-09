import React from 'react';

export enum CustomParamButtonType {
  plus = 'fa-plus',
  minus = 'fa-minus',
}

interface Props {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  className: string;
  type: CustomParamButtonType;
}

const CustomParamButton: React.FC<Props> = ({
  onClick,
  className,
  type,
}) => (
  <button className={`button ${className} is-outlined`} onClick={onClick}>
    <span className="icon">
      <i className={`fas fa-lg ${type}`}></i>
    </span>
  </button>
)

export default CustomParamButton;
