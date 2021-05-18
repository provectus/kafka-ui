import React from 'react';
import JSONTree from 'react-json-tree';

import theme from './theme';

interface MessageContentProps {
  message: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const [isFolded, setIsFolded] = React.useState(message.length > 250);
  let fullMessage: Record<string, string> | string;
  const cutMessage = `${message.slice(0, 250)}...`;
  try {
    fullMessage = JSON.parse(message);
  } catch (e) {
    fullMessage = message;
  }

  return (
    <div className="is-flex is-flex-direction-column is-align-items-center">
      {isFolded ? (
        <p className="has-content-overflow-ellipsis">{cutMessage}</p>
      ) : (
        <JSONTree
          data={fullMessage}
          theme={theme}
          shouldExpandNode={() => true}
          hideRoot
        />
      )}
      {isFolded && (
        <button
          type="button"
          className="button is-small mt-2"
          onClick={() => setIsFolded((state) => !state)}
          title="Expand to JSON"
        >
          <span className="icon is-small">
            <i className="fas fa-chevron-down" />
          </span>
        </button>
      )}
    </div>
  );
};

export default MessageContent;
