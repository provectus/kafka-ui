import React from 'react';
import { SchemaSubject } from 'generated-sources';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

interface SchemaVersionProps {
  version: SchemaSubject;
}

const SchemaVersion: React.FC<SchemaVersionProps> = ({
  version: { version, id, schema },
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  return (
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
      <td>{version}</td>
      <td>{id}</td>
      <td
        className="has-text-overflow-ellipsis is-family-code"
        style={{ width: '100%', maxWidth: 0 }}
      >
        {isOpen ? (
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
            }}
            readOnly
          />
        ) : (
          <span>{schema}</span>
        )}
      </td>
    </tr>
  );
};

export default SchemaVersion;
