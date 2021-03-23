import React from 'react';

interface ButtonProps {
  callback: () => void;
  classes?: string;
  title: string;
  style?: { [key: string]: string | number };
  text: {
    default: string;
    dynamic: string;
  };
}

const DynamicButton: React.FC<ButtonProps> = ({
  callback,
  classes,
  title,
  style,
  text,
  children,
}) => {
  const [buttonText, setButtonText] = React.useState(text.default);
  let timeout: number;
  const clickHandler = () => {
    callback();
    setButtonText(text.dynamic);
    timeout = window.setTimeout(() => setButtonText(text.default), 3000);
  };
  React.useEffect(() => () => window.clearTimeout(timeout), [callback]);
  return (
    <button
      className={classes}
      title={title}
      type="button"
      style={style}
      onClick={clickHandler}
    >
      {children}
      <span>{buttonText}</span>
    </button>
  );
};

export default DynamicButton;
