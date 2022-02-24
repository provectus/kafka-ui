import React, { useCallback, useRef } from 'react';
import cx from 'classnames';

interface DynamicTextButtonProps {
  onClick(): void;
  className?: string;
  title: string;
  delay?: number;
  render(clicked: boolean): React.ReactNode;
}

const DynamicTextButton: React.FC<DynamicTextButtonProps> = ({
  onClick,
  className,
  title,
  render,
  delay = 3000,
}) => {
  const [clicked, setClicked] = React.useState(false);

  const timeout = useRef(0);

  const clickHandler = useCallback(() => {
    onClick();
    setClicked(true);
    timeout.current = window.setTimeout(() => setClicked(false), delay);
  }, [delay, onClick]);

  React.useEffect(() => () => window.clearTimeout(timeout.current));

  return (
    <button
      className={cx('button', className)}
      title={title}
      type="button"
      onClick={clickHandler}
    >
      {render(clicked)}
    </button>
  );
};

export default DynamicTextButton;
