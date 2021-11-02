import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import React from 'react';

interface Props {
  accessors: string[];
  data: Record<string, string>;
}

const ListItem: React.FC<Props> = ({ accessors, data }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = React.useCallback(() => {
    setIsOpen((prevState) => !prevState);
  }, []);

  return (
    <>
      <tr>
        <td>
          <IconButtonWrapper onClick={toggleIsOpen}>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        </td>
        {accessors.map((accessor) => (
          <td key={accessor}>{data[accessor]}</td>
        ))}
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={accessors.length + 1}>Expanding content</td>
        </tr>
      )}
    </>
  );
};

export default ListItem;
