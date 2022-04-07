import React from 'react';
import { screen } from '@testing-library/react';
import { render, EventSourceMock } from 'lib/testHelpers';
import Messages, {
  SeekDirectionOptions,
  SeekDirectionOptionsObj,
} from 'components/Topics/Topic/Details/Messages/Messages';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SeekDirection, SeekType } from 'generated-sources';
import userEvent from '@testing-library/user-event';

describe('Messages', () => {
  const searchParams = `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&seekDirection=${SeekDirection.FORWARD}&seekType=${SeekType.OFFSET}&seekTo=0::9`;

  const setUpComponent = (param: string = searchParams) => {
    const history = createMemoryHistory();
    history.push({
      search: new URLSearchParams(param).toString(),
    });
    return render(
      <Router history={history}>
        <Messages />
      </Router>
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
      expect(screen.getByRole('listbox')).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.FORWARD].label
      );
    });

    it('should check the SeekDirection select changes', () => {
      const seekDirectionSelect = screen.getByRole('listbox');
      const seekDirectionOption = screen.getByRole('option');

      expect(seekDirectionOption).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.FORWARD].label
      );

      const labelValue1 = SeekDirectionOptions[1].label;
      userEvent.click(seekDirectionSelect);
      userEvent.selectOptions(seekDirectionSelect, [
        SeekDirectionOptions[1].label,
      ]);
      expect(seekDirectionOption).toHaveTextContent(labelValue1);

      const labelValue0 = SeekDirectionOptions[0].label;
      userEvent.click(seekDirectionSelect);
      userEvent.selectOptions(seekDirectionSelect, [
        SeekDirectionOptions[0].label,
      ]);
      expect(seekDirectionOption).toHaveTextContent(labelValue0);
    });
  });

  describe('Component rendering with custom Url search params', () => {
    it('reacts to a change of seekDirection in the url which make the select pick up different value', () => {
      setUpComponent(
        searchParams.replace(SeekDirection.FORWARD, SeekDirection.BACKWARD)
      );
      expect(screen.getByRole('listbox')).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.BACKWARD].label
      );
    });
  });
});
