import React from 'react';

interface Props {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  btnColor: string;
  btnIcon: string;
}

const CustomParamButton: React.FC<Props> = ({
  onClick,
  btnColor,
  btnIcon,
}) => (
  <button className={`button ${btnColor} is-outlined`} onClick={onClick}>
    <span className="icon">
      <i className={`fas fa-lg ${btnIcon}`}></i>
    </span>
  </button>
)

export default CustomParamButton;
