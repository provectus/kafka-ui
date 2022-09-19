import React, { PropsWithChildren } from 'react';
import Heading from 'components/common/heading/Heading.styled';

import * as S from './PageHeading.styled';

interface PageHeadingProps {
  text: string;
  backTo?: string;
  backText?: string;
}

const PageHeading: React.FC<PropsWithChildren<PageHeadingProps>> = ({
  text,
  backTo,
  backText,
  children,
}) => {
  const isBackButtonVisible = backTo && backText;

  return (
    <S.Wrapper>
      <S.Breadcrumbs>
        {isBackButtonVisible && <S.BackLink to={backTo}>{backText}</S.BackLink>}
        <Heading>{text}</Heading>
      </S.Breadcrumbs>
      <div>{children}</div>
    </S.Wrapper>
  );
};

export default PageHeading;
