import React from 'react';

import * as S from './Metrics.styled';

interface Props {
  title?: string;
}

const Section: React.FC<Props> = ({ title, children }) => {
  return (
    <div>
      {title && <S.SectionTitle>{title}</S.SectionTitle>}
      <S.IndicatorsWrapper>{children}</S.IndicatorsWrapper>
    </div>
  );
};

export default Section;
