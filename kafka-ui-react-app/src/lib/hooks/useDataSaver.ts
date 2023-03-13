import { showAlert, showSuccessAlert } from 'lib/errorHandling';

const useDataSaver = (
  subject: string,
  data: Record<string, string> | string
) => {
  const copyToClipboard = () => {
    if (navigator.clipboard) {
      const str =
        typeof data === 'string' ? String(data) : JSON.stringify(data);
      navigator.clipboard.writeText(str);
      showSuccessAlert({
        id: subject,
        title: '',
        message: 'Copied successfully!',
      });
    } else {
      showAlert('warning', {
        id: subject,
        title: 'Warning',
        message:
          'Copying to clipboard is unavailable due to unsecured (non-HTTPS) connection',
      });
    }
  };
  const saveFile = () => {
    const blob = new Blob([data as BlobPart], { type: 'text/json' });
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = subject;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  };

  return { copyToClipboard, saveFile };
};

export default useDataSaver;
