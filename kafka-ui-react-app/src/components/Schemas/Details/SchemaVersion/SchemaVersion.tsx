import React from 'react';
import { SchemaSubject } from 'generated-sources';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';

import { SchemaVersionWrapper } from './SchemaVersion.styled';

interface SchemaVersionProps {
  version: SchemaSubject;
}

const SchemaVersion: React.FC<SchemaVersionProps> = ({
  version: { version, id, schema },
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  return (
    <>
      <tr>
        <td style={{ width: '3%' }}>
          <IconButtonWrapper onClick={toggleIsOpen}>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        </td>
        <td style={{ width: '6%' }}>{version}</td>
        <td>{id}</td>
      </tr>
      {isOpen && (
        <SchemaVersionWrapper>
          <td colSpan={3}>
            <JSONViewer data={schema} />
          </td>
        </SchemaVersionWrapper>
      )}
    </>
  );
};

export default SchemaVersion;
