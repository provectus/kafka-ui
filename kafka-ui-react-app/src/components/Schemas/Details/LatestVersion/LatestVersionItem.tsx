import React from 'react';
import { SchemaSubject } from 'generated-sources';
import EditorViewer from 'components/common/EditorViewer/EditorViewer';

import {
  LatestVersionWrapper,
  MetaDataLabel,
} from './LatestVersionItem.styled';

interface LatestVersionProps {
  schema: SchemaSubject;
}

const LatestVersionItem: React.FC<LatestVersionProps> = ({
  schema: { id, subject, schema, compatibilityLevel, version, schemaType },
}) => (
  <LatestVersionWrapper>
    <div>
      <h1>Relevant version</h1>
      <EditorViewer data={schema} schemaType={schemaType} maxLines={28} />
    </div>
    <div data-testid="meta-data">
      <div>
        <MetaDataLabel>Latest version</MetaDataLabel>
        <p>{version}</p>
      </div>
      <div>
        <MetaDataLabel>ID</MetaDataLabel>
        <p>{id}</p>
      </div>
      <div>
        <MetaDataLabel>Subject</MetaDataLabel>
        <p>{subject}</p>
      </div>
      <div>
        <MetaDataLabel>Compatibility</MetaDataLabel>
        <p>{compatibilityLevel}</p>
      </div>
    </div>
  </LatestVersionWrapper>
);

export default LatestVersionItem;
