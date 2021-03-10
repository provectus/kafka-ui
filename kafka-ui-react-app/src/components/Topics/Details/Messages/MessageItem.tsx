import React from 'react';
import { format } from 'date-fns';
import { TopicMessage } from 'generated-sources';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';

export interface MessageItemProp {
  partition: TopicMessage['partition'];
  offset: TopicMessage['offset'];
  timestamp: TopicMessage['timestamp'];
  content?: TopicMessage['content'];
}

const MessageItem: React.FC<MessageItemProp> = ({
  partition,
  offset,
  timestamp,
  content,
}) => {
  const copyData = () => {
    if (navigator.clipboard)
      navigator.clipboard.writeText(JSON.stringify(content || {}));
  };
  const saveFile = () => {
    let extension = 'json';
    if (typeof content === 'string') {
      try {
        JSON.parse(content);
      } catch (e) {
        extension = 'txt';
      }
    }
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(content || {})
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `topic-message[${timestamp}].${extension}`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const buttonStyle = {
    height: '30px',
  };
  const buttonClasses = 'button is-link is-outlined topic-message-button';
  return (
    <tr>
      <td style={{ width: 200 }}>{format(timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
      <td style={{ width: 150 }}>{offset}</td>
      <td style={{ width: 100 }}>{partition}</td>
      <td style={{ wordBreak: 'break-word' }}>
        {content && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className={buttonClasses}
                data-title="Copy the message to the clipboard"
                type="button"
                style={{ ...buttonStyle, marginRight: '5px' }}
                onClick={copyData}
              >
                <i className="far fa-clipboard" />
              </button>
              <button
                className={buttonClasses}
                data-title="Download the message as a .json/.txt file"
                type="button"
                style={buttonStyle}
                onClick={saveFile}
              >
                <i className="fas fa-file-download" />
              </button>
            </div>
            <JSONViewer data={content as { [key: string]: string }} />
          </div>
        )}
      </td>
    </tr>
  );
};

export default MessageItem;
