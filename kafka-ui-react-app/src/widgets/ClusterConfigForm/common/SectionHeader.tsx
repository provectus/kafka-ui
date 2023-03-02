import * as React from 'react';
import { Button } from 'components/common/Button/Button';
import Heading from 'components/common/heading/Heading.styled';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';

interface SectionHeaderProps {
  title: string;
  addButtonText: string;
  adding?: boolean;
  onClick: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  adding,
  title,
  addButtonText,
  onClick,
}) => {
  return (
    <S.FlexRow>
      <S.FlexGrow1>
        <Heading level={3}>{title}</Heading>
      </S.FlexGrow1>
      <Button buttonSize="M" buttonType="primary" onClick={onClick}>
        {adding ? addButtonText : 'Remove from config'}
      </Button>
    </S.FlexRow>
  );
};

export default SectionHeader;
