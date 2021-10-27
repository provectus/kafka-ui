import React from 'react';
import { useHistory } from 'react-router-dom';
import { ConsumerGroup } from 'generated-sources';
import { styled } from 'lib/themedStyles';
import TagStyled from 'components/common/Tag/Tag.styled';

const ListItemWrappperStyled = styled.tr`
  &:hover {
    cursor: pointer;
  }
`;

const ListItem: React.FC<{ consumerGroup: ConsumerGroup }> = ({
  consumerGroup,
}) => {
  const history = useHistory();

  function goToConsumerGroupDetails() {
    history.push(`consumer-groups/${consumerGroup.groupId}`);
  }

  return (
    <ListItemWrappperStyled onClick={goToConsumerGroupDetails}>
      <td>{consumerGroup.groupId}</td>
      <td>{consumerGroup.members}</td>
      <td>{consumerGroup.topics}</td>
      <td>{consumerGroup.messagesBehind}</td>
      <td>{consumerGroup.coordinator?.id}</td>
      <td>
        <TagStyled
          color="yellow"
          text={consumerGroup.state?.toString() || ''}
        />
      </td>
    </ListItemWrappperStyled>
  );
};

export default ListItem;
