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
      </tr>
      {isOpen && <TopicContents consumers={consumers} />}
    </>
  );
};

export default ListItem;
