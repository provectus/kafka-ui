/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import classNames from 'classnames';

interface TabsProps {
  tabs: string[];
  defaultSelectedIndex?: number;
  onChange?(index: number): void;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultSelectedIndex = 0,
  onChange,
  children,
}) => {
  const [selectedIndex, setSelectedIndex] =
    React.useState(defaultSelectedIndex);

  React.useEffect(() => {
    setSelectedIndex(defaultSelectedIndex);
  }, [defaultSelectedIndex]);

  const handleChange = React.useCallback(
    (index: number) => {
      setSelectedIndex(index);
      onChange?.(index);
    },
    [onChange]
  );

  return (
    <>
      <div className="tabs">
        <ul>
          {tabs.map((tab, index) => (
            <li
              key={tab}
              className={classNames({ 'is-active': index === selectedIndex })}
            >
              <a
                role="button"
                tabIndex={index}
                onClick={() => handleChange(index)}
                onKeyDown={() => handleChange(index)}
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {React.Children.toArray(children)[selectedIndex]}
    </>
  );
};

export default Tabs;
