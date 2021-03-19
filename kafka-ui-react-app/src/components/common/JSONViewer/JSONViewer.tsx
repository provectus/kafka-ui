import React from 'react';
import JSONTree from 'react-json-tree';
import useDataSaver from 'lib/hooks/useDataSaver';
import theme from './themes/google';
import DynamicButton from './DynamicButton';

interface JSONViewerProps {
  data: {
    [key: string]: string;
  };
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data }) => {
  const { copyToClipboard, saveFile } = useDataSaver();
  const copyButtonHandler = () => {
    copyToClipboard(JSON.stringify(data));
  };
  const buttonClasses = 'button is-link is-outlined is-small is-centered';
  return (
    <div>
      <JSONTree
        data={data}
        theme={theme}
        shouldExpandNode={() => true}
        hideRoot
      />
      <div className="field has-addons is-justify-content-flex-end">
        <DynamicButton
          callback={copyButtonHandler}
          classes={`${buttonClasses} mr-1`}
          title="Copy the message to the clipboard"
          text={{ default: 'Copy', dynamic: 'Copied!' }}
        >
          <span className="icon">
            <i className="far fa-clipboard" />
          </span>
        </DynamicButton>
        <button
          className={buttonClasses}
          title="Download the message as a .json/.txt file"
          type="button"
          onClick={() => saveFile(JSON.stringify(data), `topic-message`)}
        >
          <span className="icon">
            <i className="fas fa-file-download" />
          </span>
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default JSONViewer;
