import { TextEncoder } from 'util';

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import MessageContent, {
  MessageContentProps,
} from 'components/Topics/Topic/Messages/MessageContent/MessageContent';
import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { theme } from 'theme/theme';

const setupWrapper = (props?: Partial<MessageContentProps>) => {
  return (
    <table>
      <tbody>
        <MessageContent
          messageKey='"test-key"'
          messageContent='{"data": "test"}'
          headers={{ header: 'test' }}
          timestamp={new Date(0)}
          timestampType={TopicMessageTimestampTypeEnum.CREATE_TIME}
          keySerde="SchemaRegistry"
          valueSerde="Avro"
          {...props}
        />
      </tbody>
    </table>
  );
};

global.TextEncoder = TextEncoder;

// Ace hangs the editor off its container element; the search binding assertion
// below is the only way to reach it from a test.
interface AceEditorInstance {
  commands: {
    commandKeyBinding: Record<
      string,
      | {
          name?: string;
          readOnly?: boolean;
          bindKey?: { win: string; mac: string };
        }
      | undefined
    >;
  };
}

describe('MessageContent search', () => {
  const searchInputName = 'Find in message';

  beforeEach(() => {
    render(setupWrapper());
  });

  it('keeps the search bar hidden until it is asked for', () => {
    expect(
      screen.queryByRole('textbox', { name: searchInputName })
    ).not.toBeInTheDocument();
  });

  it('opens the search bar on Ctrl+F', async () => {
    await userEvent.keyboard('{Control>}f{/Control}');

    expect(
      screen.getByRole('textbox', { name: searchInputName })
    ).toBeInTheDocument();
  });

  it('suppresses the browser find bar by preventing the default', () => {
    // fireEvent returns false when the handler called preventDefault, which is
    // what stops the browser's own find bar from opening over ours.
    const notPrevented = fireEvent.keyDown(
      screen.getByTestId('message-panel'),
      { key: 'f', ctrlKey: true }
    );

    expect(notPrevented).toBe(false);
  });

  it('leaves unrelated keystrokes alone', () => {
    const notPrevented = fireEvent.keyDown(
      screen.getByTestId('message-panel'),
      { key: 'f' }
    );

    expect(notPrevented).toBe(true);
    expect(
      screen.queryByRole('textbox', { name: searchInputName })
    ).not.toBeInTheDocument();
  });

  it('opens the search bar when the shortcut is pressed inside the editor', async () => {
    // Ace owns a hidden textarea, so the shortcut is first seen there.
    const aceTextarea = document.querySelector('textarea');
    expect(aceTextarea).not.toBeNull();
    (aceTextarea as HTMLTextAreaElement).focus();

    await userEvent.keyboard('{Control>}f{/Control}');

    expect(
      screen.getByRole('textbox', { name: searchInputName })
    ).toBeInTheDocument();
  });

  it("binds Ctrl/Cmd+F to our handler in Ace's own keymap", () => {
    // jsdom does not deliver synthetic key events to the native listener Ace
    // installs, so the test above only exercises the bubbling fallback. Assert
    // the binding itself, which is what takes effect in a real browser and is
    // the piece that would silently break if the command were renamed or lost
    // its readOnly flag.
    const container = document.querySelector('.ace_editor') as HTMLElement & {
      env?: { editor: AceEditorInstance };
    };
    const command = container?.env?.editor.commands.commandKeyBinding['ctrl-f'];

    expect(command).toBeDefined();
    expect(command?.bindKey).toEqual({ win: 'Ctrl-F', mac: 'Command-F' });
    // The viewer is read-only; Ace skips commands not marked as readOnly-safe.
    expect(command?.readOnly).toBe(true);
  });

  it('opens the search bar on Meta+F', async () => {
    await userEvent.keyboard('{Meta>}f{/Meta}');

    expect(
      screen.getByRole('textbox', { name: searchInputName })
    ).toBeInTheDocument();
  });

  it('closes the search bar on Escape', async () => {
    await userEvent.keyboard('{Control>}f{/Control}');
    await userEvent.keyboard('{Escape}');

    expect(
      screen.queryByRole('textbox', { name: searchInputName })
    ).not.toBeInTheDocument();
  });

  it('returns focus to the panel on close so the shortcut still works', async () => {
    await userEvent.keyboard('{Control>}f{/Control}');
    expect(
      screen.getByRole('textbox', { name: searchInputName })
    ).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(screen.getByTestId('message-panel')).toHaveFocus();

    // Without the handover the next shortcut would reach the browser instead.
    await userEvent.keyboard('{Control>}f{/Control}');
    expect(
      screen.getByRole('textbox', { name: searchInputName })
    ).toBeInTheDocument();
  });

  it('closes the search bar when the active tab changes', async () => {
    await userEvent.keyboard('{Control>}f{/Control}');
    expect(
      screen.getByRole('textbox', { name: searchInputName })
    ).toBeInTheDocument();

    await userEvent.click(screen.getAllByText('Key')[0]);

    expect(
      screen.queryByRole('textbox', { name: searchInputName })
    ).not.toBeInTheDocument();
  });
});

describe('MessageContent screen', () => {
  beforeEach(() => {
    render(setupWrapper());
  });

  describe('Checking keySerde and valueSerde', () => {
    it('keySerde in document', () => {
      expect(screen.getByText('SchemaRegistry')).toBeInTheDocument();
    });

    it('valueSerde in document', () => {
      expect(screen.getByText('Avro')).toBeInTheDocument();
    });
  });

  describe('when switched to display the key', () => {
    it('makes key tab active', async () => {
      const keyTab = screen.getAllByText('Key');
      await userEvent.click(keyTab[0]);
      expect(keyTab[0]).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });

  describe('when switched to display the headers', () => {
    it('makes Headers tab active', async () => {
      await userEvent.click(screen.getByText('Headers'));
      expect(screen.getByText('Headers')).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });

  describe('when switched to display the value', () => {
    it('makes value tab active', async () => {
      const contentTab = screen.getAllByText('Value');
      await userEvent.click(contentTab[0]);
      expect(contentTab[0]).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });
});
