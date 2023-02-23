import * as React from 'react';
import { Button } from 'components/common/Button/Button';
import Heading from 'components/common/heading/Heading.styled';

import { FlexGrow1, FlexRow } from './ClusterConfigForm.styled';

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
    <FlexRow>
      <FlexGrow1>
        <Heading level={3}>{title}</Heading>
      </FlexGrow1>
      <Button buttonSize="M" buttonType="primary" onClick={onClick}>
        {adding ? addButtonText : 'Remove from config'}
      </Button>
    </FlexRow>
  );
};

export default SectionHeader;
