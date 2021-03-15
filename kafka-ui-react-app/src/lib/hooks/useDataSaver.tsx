const useDataSaver = () => {
  const copyToClipboard = (content: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(content);
  };

  const saveFile = (content: string, fileName: string) => {
    let extension = 'json';
    try {
      JSON.parse(content);
    } catch (e) {
      extension = 'txt';
    }
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      content
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${fileName}.${extension}`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return { copyToClipboard, saveFile };
};

export default useDataSaver;
