import React from 'react';

import * as S from './ProgressBar.styled';

interface ProgressBarProps {
  completed: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed }) => {
  const p = Math.max(Math.min(completed, 100), 0);
  return (
    <S.Wrapper>
      <S.Filler role="progressbar" completed={p} />
    </S.Wrapper>
  );
};

export default ProgressBar;
