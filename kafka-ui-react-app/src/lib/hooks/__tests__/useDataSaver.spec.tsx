import useDataSaver from '../useDataSaver';

describe('useDataSaver hook', () => {
  const content = {
    title: 'title',
  };
  it('downloads the file', () => {
    const link: HTMLAnchorElement = document.createElement('a');
    link.click = jest.fn();

    const mockDate = new Date(1466424490000);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const mockCreate = jest
      .spyOn(document, 'createElement')
      .mockImplementation(() => link);
    const { saveFile } = useDataSaver('message', content);
    saveFile();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(link.download).toEqual('message_1466424490000.json');
    expect(link.href).toEqual(
      `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(content)
      )}`
    );
    expect(link.click).toHaveBeenCalledTimes(1);
  });

  it('copies the data to the clipboard', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    jest.spyOn(navigator.clipboard, 'writeText');
    const { copyToClipboard } = useDataSaver('topic', content);
    copyToClipboard();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(content)
    );
  });
});
