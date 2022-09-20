import React from 'react';
import { TopicMessage } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import useDataSaver from 'lib/hooks/useDataSaver';

const ActionsCell: React.FC<CellContext<TopicMessage, unknown>> = ({ row }) => {
  const { content } = row.original;

  const { copyToClipboard, saveFile } = useDataSaver(
    'topic-message',
    content || ''
  );

  return (
    <Dropdown>
      <DropdownItem onClick={copyToClipboard}>
        Copy content to clipboard
      </DropdownItem>
      <DropdownItem onClick={saveFile}>Save content as a file</DropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
