import { isObject } from 'lodash';

const useDataSaver = (
  subject: string,
  data: Record<string, string> | string
) => {
  const copyToClipboard = () => {
    if (navigator.clipboard) {
      const str = JSON.stringify(data);
      navigator.clipboard.writeText(str);
    }
  };

  const saveFile = () => {
    const extension = isObject(data) ? 'json' : 'txt';
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `${subject}_${new Date().getTime()}.${extension}`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return { copyToClipboard, saveFile };
};

export default useDataSaver;
