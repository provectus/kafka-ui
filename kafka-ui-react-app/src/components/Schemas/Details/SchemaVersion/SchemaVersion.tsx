import React from 'react';
import { SchemaSubject } from 'generated-sources';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import EditorViewer from 'components/common/EditorViewer/EditorViewer';

import * as S from './SchemaVersion.styled';

interface SchemaVersionProps {
  version: SchemaSubject;
}

const SchemaVersion: React.FC<SchemaVersionProps> = ({
  version: { version, id, schema, schemaType },
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
        <S.Wrapper>
          <td colSpan={3}>
            <EditorViewer data={schema} schemaType={schemaType} />
          </td>
        </S.Wrapper>
      )}
    </>
  );
};

export default SchemaVersion;
