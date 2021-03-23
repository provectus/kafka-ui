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
    let extension = 'json';
    const str = JSON.stringify(data);

    try {
      JSON.parse(str);
    } catch (e) {
      extension = 'txt';
    }

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(str)}`;
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
