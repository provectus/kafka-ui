import React from 'react';

import FullMessage from './FullMessage';

interface MessageContentProps {
  message: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const [isFolded, setIsFolded] = React.useState(message.length > 250);

  return (
    <div className="is-flex is-flex-direction-column">
      {isFolded ? (
        <p className="has-content-overflow-ellipsis">
          {`${message.slice(0, 250)}...`}
        </p>
      ) : (
        <FullMessage message={message} />
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
