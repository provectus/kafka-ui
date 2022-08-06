import React from 'react';

import * as S from './TraceContent.styled';

export interface TraceContentProps {
  traceContent?: string;
}

const TraceContent: React.FC<TraceContentProps> = ({ traceContent }) => {
  return (
    <S.Wrapper>
      <td colSpan={10}>
        <S.Section>
          <S.ContentBox>
            <S.TraceValue>{traceContent}</S.TraceValue>
          </S.ContentBox>
        </S.Section>
      </td>
    </S.Wrapper>
  );
};

export default TraceContent;
