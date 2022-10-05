import React from 'react';
import { ConsumerGroupTopicPartition } from 'generated-sources';
import { Link } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces/cluster';
import { clusterTopicPath } from 'lib/paths';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';

import TopicContents from './TopicContents/TopicContents';
import { ToggleButton } from './ListItem.styled';

interface Props {
  clusterName: ClusterName;
  name: string;
  consumers: ConsumerGroupTopicPartition[];
}

const ListItem: React.FC<Props> = ({ clusterName, name, consumers }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getTotalMessagesBehind = () => {
    let count = 0;
    consumers.forEach((consumer) => {
      count += consumer?.messagesBehind || 0;
    });
    return count;
  };

  return (
    <>
      <tr>
        <ToggleButton>
          <IconButtonWrapper onClick={() => setIsOpen(!isOpen)} aria-hidden>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        </ToggleButton>
        <TableKeyLink>
          <Link to={clusterTopicPath(clusterName, name)}>{name}</Link>
        </TableKeyLink>
        <td>{getTotalMessagesBehind()}</td>
      </tr>
      {isOpen && <TopicContents consumers={consumers} />}
    </>
  );
};

export default ListItem;
