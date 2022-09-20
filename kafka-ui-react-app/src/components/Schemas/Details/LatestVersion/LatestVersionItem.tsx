import React from 'react';
import { SchemaSubject } from 'generated-sources';
import EditorViewer from 'components/common/EditorViewer/EditorViewer';
import Heading from 'components/common/heading/Heading.styled';

import * as S from './LatestVersionItem.styled';

interface LatestVersionProps {
  schema: SchemaSubject;
}

const LatestVersionItem: React.FC<LatestVersionProps> = ({
  schema: { id, subject, schema, compatibilityLevel, version, schemaType },
}) => (
  <S.Wrapper>
    <div>
      <Heading level={3}>Actual version</Heading>
      <EditorViewer data={schema} schemaType={schemaType} maxLines={28} />
    </div>
    <div>
      <div>
        <S.MetaDataLabel>Latest version</S.MetaDataLabel>
        <p>{version}</p>
      </div>
      <div>
        <S.MetaDataLabel>ID</S.MetaDataLabel>
        <p>{id}</p>
      </div>
      <div>
        <S.MetaDataLabel>Type</S.MetaDataLabel>
        <p>{schemaType}</p>
      </div>
      <div>
        <S.MetaDataLabel>Subject</S.MetaDataLabel>
        <p>{subject}</p>
      </div>
      <div>
        <S.MetaDataLabel>Compatibility</S.MetaDataLabel>
        <p>{compatibilityLevel}</p>
      </div>
    </div>
  </S.Wrapper>
);

export default LatestVersionItem;
