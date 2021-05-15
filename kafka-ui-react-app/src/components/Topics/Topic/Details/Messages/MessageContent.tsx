import React from 'react';
import JSONTree from 'react-json-tree';

interface MessageContentProps {
  message: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const [isFolded, setIsFolded] = React.useState(message.length > 200);
  let content: Record<string, string> | string;
  try {
    content = JSON.parse(message);
  } catch (e) {
    content = message;
  }
  const theme = {
    scheme: 'google',
    author: 'seth wright (http://sethawright.com)',
    base00: '#1d1f21',
    base01: '#282a2e',
    base02: '#373b41',
    base03: '#969896',
    base04: '#b4b7b4',
    base05: '#c5c8c6',
    base06: '#e0e0e0',
    base07: '#ffffff',
    base08: '#CC342B',
    base09: '#F96A38',
    base0A: '#FBA922',
    base0B: '#198844',
    base0C: '#3971ED',
    base0D: '#3971ED',
    base0E: '#A36AC7',
    base0F: '#3971ED',
  };
  return (
    <div className="is-flex is-flex-direction-column is-align-items-center">
      {isFolded ? (
        <p
          style={{
            maxHeight: '160px',
            overflow: 'hidden',
            textOverflow: 'elipsis',
            background:
              '-webkit-linear-gradient(90deg, rgba(0, 0, 0, .1) 0%, rgba(0, 0, 0, 1) 40%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {message}
        </p>
      ) : (
        <JSONTree
          data={content}
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
