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
          <span
            className="icon has-text-link is-size-7 is-small is-clickable"
            onClick={toggleIsOpen}
            aria-hidden
          >
            <i className={`fas fa-${isOpen ? 'minus' : 'plus'}`} />
          </span>
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
