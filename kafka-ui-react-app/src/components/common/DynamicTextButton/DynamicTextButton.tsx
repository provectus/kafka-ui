import React, { useCallback } from 'react';
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

  let timeout: number;

  const clickHandler = useCallback(() => {
    onClick();
    setClicked(true);
    timeout = window.setTimeout(() => setClicked(false), delay);
  }, []);

  React.useEffect(() => () => window.clearTimeout(timeout), []);

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
