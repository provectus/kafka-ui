import React from 'react';
import { ClusterName, TopicMessage, TopicName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { format } from 'date-fns';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  isFetched: boolean;
  fetchTopicMessages: (clusterName: ClusterName, topicName: TopicName) => void;
  messages: TopicMessage[];
}

const Messages: React.FC<Props> = ({
  isFetched,
  clusterName,
  topicName,
  messages,
  fetchTopicMessages,
}) => {
  React.useEffect(() => {
    fetchTopicMessages(clusterName, topicName);
  }, [fetchTopicMessages, clusterName, topicName]);

  const [searchText, setSearchText] = React.useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const getTimestampDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'MM.dd.yyyy HH:mm:ss');
  };

  const getMessageContentHeaders = () => {
    const message = messages[0];
    const headers: JSX.Element[] = [];
    const content = JSON.parse(message.content);
    Object.keys(content).forEach((k) =>
      headers.push(<th>{`content.${k}`}</th>)
    );

    return headers;
  };

  const getMessageContentBody = (content: string) => {
    const c = JSON.parse(content);
    const columns: JSX.Element[] = [];
    Object.values(c).map((v) => columns.push(<td>{JSON.stringify(v)}</td>));
    return columns;
  };

  return (
    // eslint-disable-next-line no-nested-ternary
    isFetched ? (
      messages.length > 0 ? (
        <div>
          <div className="columns">
            <div className="column is-half is-offset-half">
              <input
                id="searchText"
                type="text"
                name="searchText"
                className="input"
                placeholder="Search"
                value={searchText}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Offset</th>
                <th>Partition</th>
                {getMessageContentHeaders()}
              </tr>
            </thead>
            <tbody>
              {messages
                .filter(
                  (message) =>
                    !searchText || message?.content?.indexOf(searchText) >= 0
                )
                .map((message) => (
                  <tr key={message.timestamp}>
                    <td>{getTimestampDate(message.timestamp)}</td>
                    <td>{message.offset}</td>
                    <td>{message.partition}</td>
                    {getMessageContentBody(message.content)}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No messages at selected topic</div>
      )
    ) : (
      <PageLoader isFullHeight={false} />
    )
  );
};

export default Messages;
