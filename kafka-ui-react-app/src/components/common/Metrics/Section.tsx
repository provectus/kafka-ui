import React, { PropsWithChildren } from 'react';

import * as S from './Metrics.styled';

interface Props {
  title?: string;
}

const Section: React.FC<PropsWithChildren<Props>> = ({ title, children }) => (
  <div role="group">
    {title && <S.SectionTitle>{title}</S.SectionTitle>}
    <S.IndicatorsWrapper>{children}</S.IndicatorsWrapper>
  </div>
);

export default Section;
