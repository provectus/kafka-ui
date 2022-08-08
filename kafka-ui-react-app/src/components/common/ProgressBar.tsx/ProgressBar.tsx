import React from 'react';

import * as S from './ProgressBar.styled';

interface ProgressBarProps {
  completed: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed }) => {
  return (
    <S.Wrapper>
      <S.Filler role="progressbar" completed={completed} />
    </S.Wrapper>
  );
};

export default ProgressBar;
