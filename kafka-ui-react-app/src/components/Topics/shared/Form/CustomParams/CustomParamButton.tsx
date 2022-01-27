import ButtonMinusIcon from 'components/common/Icons/CustomButtonIcons/ButtonMinusIcon';
import ButtonPlusIcon from 'components/common/Icons/CustomButtonIcons/ButtonPlusIcon';
import ButtonRightChevronIcon from 'components/common/Icons/CustomButtonIcons/ButtonRightChevronIcon';
import React from 'react';

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
}) => {
  const typeSwitcher = (typeBtn: Props['type']) => {
    switch (typeBtn) {
      case 'fa-plus':
        return <ButtonPlusIcon />;
      case 'fa-minus':
        return <ButtonMinusIcon />;
      case 'fa-chevron-right':
        return <ButtonRightChevronIcon />;
      default:
        return null;
    }
  };

  return (
    <button
      type="button"
      className={`button ${className} is-outlined`}
      onClick={onClick}
    >
      {btnText && <span>{btnText}</span>}
      {typeSwitcher(type)}
      {/* <span className="icon">
      <i className={`fas fa-lg ${type}`} />
    </span> */}
    </button>
  );
};

export default CustomParamButton;
