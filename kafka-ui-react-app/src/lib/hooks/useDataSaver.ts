import isObject from 'lodash/isObject';
import { alertAdded, alertDissmissed } from 'redux/reducers/alerts/alertsSlice';
import { useAppDispatch } from 'lib/hooks/redux';

const AUTO_DISMISS_TIME = 2000;

const useDataSaver = (
  subject: string,
  data: Record<string, string> | string
) => {
  const dispatch = useAppDispatch();
  const copyToClipboard = () => {
    if (navigator.clipboard) {
      const str =
        typeof data === 'string' ? String(data) : JSON.stringify(data);
      navigator.clipboard.writeText(str);
      dispatch(
        alertAdded({
          id: subject,
          type: 'success',
          title: '',
          message: 'Copied successfully!',
          createdAt: Date.now(),
        })
      );
      setTimeout(() => dispatch(alertDissmissed(subject)), AUTO_DISMISS_TIME);
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
