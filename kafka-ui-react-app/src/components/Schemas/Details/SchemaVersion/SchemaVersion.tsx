import React from 'react';
import { SchemaSubject } from 'generated-sources';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';

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
            <div>
              <JSONEditor
                isFixedHeight
                name="schema"
                value={
                  schema.trim().startsWith('{')
                    ? JSON.stringify(JSON.parse(schema), null, '\t')
                    : schema
                }
                setOptions={{
                  showLineNumbers: false,
                  maxLines: 40,
                  showGutter: false,
                }}
                readOnly
              />
            </div>
          </td>
        </SchemaVersionWrapper>
      )}
    </>
  );
};

export default SchemaVersion;
