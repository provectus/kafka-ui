import React, { useEffect } from 'react';
import useDataSaver from 'lib/hooks/useDataSaver';
import { render } from '@testing-library/react';

describe('useDataSaver hook', () => {
  const content = {
    title: 'title',
  };

  describe('Save as file', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('Wed Mar 24 2021 03:19:56 GMT-0700'));
    });

    afterAll(() => jest.useRealTimers());

    it('downloads txt file', () => {
      global.URL.createObjectURL = jest.fn();
      const link: HTMLAnchorElement = document.createElement('a');
      link.click = jest.fn();

      const mockCreate = jest
        .spyOn(document, 'createElement')
        .mockImplementation(() => link);

      const HookWrapper: React.FC = () => {
        const { saveFile } = useDataSaver('message', 'content');
        useEffect(() => saveFile(), [saveFile]);
        return null;
      };

      render(<HookWrapper />);
      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(link.download).toEqual('message');
      expect(link.click).toHaveBeenCalledTimes(1);

      mockCreate.mockRestore();
    });
  });

  describe('copies the data to the clipboard', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    jest.spyOn(navigator.clipboard, 'writeText');

    it('data with type Object', () => {
      const HookWrapper: React.FC = () => {
        const { copyToClipboard } = useDataSaver('topic', content);
        useEffect(() => copyToClipboard(), [copyToClipboard]);
        return null;
      };
      render(<HookWrapper />);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(content)
      );
    });

    it('data with type String', () => {
      const HookWrapper: React.FC = () => {
        const { copyToClipboard } = useDataSaver(
          'topic',
          '{ title: "title", }'
        );
        useEffect(() => copyToClipboard(), [copyToClipboard]);
        return null;
      };
      render(<HookWrapper />);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        String('{ title: "title", }')
      );
    });
  });
});
