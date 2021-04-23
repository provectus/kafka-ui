import React from 'react';
import { SchemaSubject } from 'generated-sources';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

interface SchemaVersionProps {
  version: SchemaSubject;
}

const SchemaVersion: React.FC<SchemaVersionProps> = ({
  version: { version, id, schema },
}) => {
  return (
    <tr>
      <td>{version}</td>
      <td>{id}</td>
      <td>
        <JSONEditor
          name="schema"
          value={JSON.stringify(JSON.parse(schema), null, '\t')}
          showGutter={false}
          readOnly
        />
      </td>
    </tr>
  );
};

export default SchemaVersion;
