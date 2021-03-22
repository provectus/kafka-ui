import React from 'react';
import { SchemaSubject } from 'generated-sources';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';

interface LatestVersionProps {
  schema: SchemaSubject;
}

const LatestVersionItem: React.FC<LatestVersionProps> = ({
  schema: { id, subject, schema, compatibilityLevel },
}) => {
  return (
    <div className="tile is-ancestor mt-1">
      <div className="tile is-4 is-parent">
        <div className="tile is-child">
          <table className="table is-fullwidth">
            <tbody>
              <tr>
                <td>ID</td>
                <td>{id}</td>
              </tr>
              <tr>
                <td>Subject</td>
                <td>{subject}</td>
              </tr>
              <tr>
                <td>Compatibility</td>
                <td>{compatibilityLevel}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="tile is-parent">
        <div className="tile is-child box py-1">
          <JSONViewer data={JSON.parse(schema)} />
        </div>
      </div>
    </div>
  );
};

export default LatestVersionItem;
