import React from 'react';
import { screen, waitFor, prettyDOM } from '@testing-library/react';
import { render, EventSourceMock } from 'lib/testHelpers';
import Messages, {
  SeekDirectionOptions,
  SeekDirectionOptionsObj,
} from 'components/Topics/Topic/Details/Messages/Messages';
import { MemoryRouter } from 'react-router-dom';
import { createPath } from 'history';
import { SeekDirection, SeekType } from 'generated-sources';
import userEvent from '@testing-library/user-event';

describe('Messages', () => {
  const search = `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&seekDirection=${SeekDirection.FORWARD}&seekType=${SeekType.OFFSET}&seekTo=0::9`;

  const setUpComponent = (
    initialEntries: string[] = [createPath({ search })]
  ) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Messages />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    Object.defineProperty(window, 'EventSource', {
      value: EventSourceMock,
    });
  });
  describe('component rendering default behavior with the search params', () => {
    beforeEach(() => {
      setUpComponent();
    });
    it('should check default seekDirection if it actually take the value from the url', () => {
      expect(screen.getAllByRole('listbox')[1]).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.FORWARD].label
      );
    });

    it('should check the SeekDirection select changes', async () => {
      const seekDirectionSelect = screen.getAllByRole('listbox')[1];
      const seekDirectionOption = screen.getAllByRole('option')[1];

      expect(seekDirectionOption).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.FORWARD].label
      );
      const labelValue1 = SeekDirectionOptions[1].label;
      await waitFor(() => userEvent.click(seekDirectionSelect));

      await waitFor(() =>
        userEvent.selectOptions(seekDirectionSelect, [
          SeekDirectionOptions[1].label,
        ])
      );

      expect(seekDirectionOption).toHaveTextContent(labelValue1);

      const labelValue0 = SeekDirectionOptions[0].label;
      await waitFor(() => userEvent.click(seekDirectionSelect));
      await waitFor(() =>
        userEvent.selectOptions(seekDirectionSelect, [
          SeekDirectionOptions[0].label,
        ])
      );

      expect(seekDirectionOption).toHaveTextContent(labelValue0);
    });
  });

  describe('Component rendering with custom Url search params', () => {
    it('reacts to a change of seekDirection in the url which make the select pick up different value', () => {
      setUpComponent([
        createPath({
          search: search.replace(SeekDirection.FORWARD, SeekDirection.BACKWARD),
        }),
      ]);
      expect(screen.getAllByRole('listbox')[1]).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.BACKWARD].label
      );
    });
  });
});
