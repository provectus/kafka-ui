import React from 'react';
import { SchemaSubject } from 'generated-sources';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';

import { LatestVersionWrapper } from './LatestVersionItem.styled';

interface LatestVersionProps {
  schema: SchemaSubject;
}

const LatestVersionItem: React.FC<LatestVersionProps> = ({
  schema: { id, subject, schema, compatibilityLevel, version },
}) => (
  <LatestVersionWrapper>
    <div>
      <h1>Relevant version</h1>
      <JSONViewer
        data={
          schema.trim().startsWith('{')
            ? JSON.stringify(JSON.parse(schema), null, '\t')
            : schema
        }
      />
    </div>
    <div className="meta-data">
      <div>
        <h3 className="meta-data-label">Latest version</h3>
        <p>{version}</p>
      </div>
      <div>
        <h3 className="meta-data-label">ID</h3>
        <p>{id}</p>
      </div>
      <div>
        <h3 className="meta-data-label">Subject</h3>
        <p>{subject}</p>
      </div>
      <div>
        <h3 className="meta-data-label">Compatibility</h3>
        <p>{compatibilityLevel}</p>
      </div>
    </div>
  </LatestVersionWrapper>
);

export default LatestVersionItem;
