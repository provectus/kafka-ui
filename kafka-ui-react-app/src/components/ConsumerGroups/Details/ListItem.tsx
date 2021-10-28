import React from 'react';
import { ConsumerGroupTopicPartition } from 'generated-sources';
import { Link } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces/cluster';
import { clusterTopicPath } from 'lib/paths';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';

import TopicContents from './TopicContents/TopicContents';
import { ListItemWrapper } from './ListItem.styled';

interface Props {
  clusterName: ClusterName;
  name: string;
  consumers: ConsumerGroupTopicPartition[];
}

const ListItem: React.FC<Props> = ({ clusterName, name, consumers }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <ListItemWrapper>
        <td className="toggle-button">
          <span
            className="is-clickable"
            onClick={() => setIsOpen(!isOpen)}
            aria-hidden
          >
            <MessageToggleIcon isOpen={isOpen} />
          </span>
        </td>
        <td>
          <Link className="topic-link" to={clusterTopicPath(clusterName, name)}>
            {name}
          </Link>
        </td>
      </ListItemWrapper>
      {isOpen && <TopicContents consumers={consumers} />}
    </>
  );
};

export default ListItem;
