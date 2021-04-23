import React from 'react';
import { SchemaSubject } from 'generated-sources';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

interface LatestVersionProps {
  schema: SchemaSubject;
}

const LatestVersionItem: React.FC<LatestVersionProps> = ({
  schema: { id, subject, schema, compatibilityLevel },
}) => (
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
      <div className="tile is-child box">
        <JSONEditor
          name="schema"
          value={JSON.stringify(JSON.parse(schema), null, '\t')}
          showGutter={false}
          readOnly
        />
      </div>
    </div>
  </div>
);

export default LatestVersionItem;
