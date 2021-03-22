import React from 'react';
import { SchemaSubject } from 'generated-sources';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';

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
      <td className="py-0">
        <JSONViewer data={JSON.parse(schema)} />
      </td>
    </tr>
  );
};

export default SchemaVersion;
