import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, EventSourceMock, WithRoute } from 'lib/testHelpers';
import Messages, {
  SeekDirectionOptions,
  SeekDirectionOptionsObj,
} from 'components/Topics/Topic/Messages/Messages';
import { SeekDirection, SeekType } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import { clusterTopicMessagesPath } from 'lib/paths';

describe('Messages', () => {
  const searchParams = `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&seekDirection=${SeekDirection.FORWARD}&seekType=${SeekType.OFFSET}&seekTo=0::9`;
  const renderComponent = (param: string = searchParams) => {
    const query = new URLSearchParams(param).toString();
    const path = `${clusterTopicMessagesPath()}?${query}`;
    return render(
      <WithRoute path={clusterTopicMessagesPath()}>
        <Messages />
      </WithRoute>,
      {
        initialEntries: [path],
      }
    );
  };

  beforeEach(() => {
    Object.defineProperty(window, 'EventSource', {
      value: EventSourceMock,
    });
  });
  describe('component rendering default behavior with the search params', () => {
    beforeEach(() => {
      renderComponent();
    });
    it('should check default seekDirection if it actually take the value from the url', () => {
      expect(screen.getAllByRole('listbox')[1]).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.FORWARD].label
      );
    });

    it('should check the SeekDirection select changes with live option', async () => {
      const seekDirectionSelect = screen.getAllByRole('listbox')[1];
      const seekDirectionOption = screen.getAllByRole('option')[1];

      expect(seekDirectionOption).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.FORWARD].label
      );

      const labelValue1 = SeekDirectionOptions[1].label;
      userEvent.click(seekDirectionSelect);
      userEvent.selectOptions(seekDirectionSelect, [labelValue1]);
      expect(seekDirectionOption).toHaveTextContent(labelValue1);

      const labelValue0 = SeekDirectionOptions[0].label;
      userEvent.click(seekDirectionSelect);
      userEvent.selectOptions(seekDirectionSelect, [labelValue0]);
      expect(seekDirectionOption).toHaveTextContent(labelValue0);

      const liveOptionConf = SeekDirectionOptions[2];
      const labelValue2 = liveOptionConf.label;
      userEvent.click(seekDirectionSelect);
      const liveModeLi = screen.getByRole(
        (role, element) =>
          role === 'option' &&
          element?.getAttribute('value') === liveOptionConf.value
      );
      userEvent.selectOptions(seekDirectionSelect, [liveModeLi]);
      expect(seekDirectionOption).toHaveTextContent(labelValue2);

      await waitFor(() => {
        expect(screen.getByRole('contentLoader')).toBeInTheDocument();
      });
    });
  });

  describe('Component rendering with custom Url search params', () => {
    it('reacts to a change of seekDirection in the url which make the select pick up different value', () => {
      renderComponent(
        searchParams.replace(SeekDirection.FORWARD, SeekDirection.BACKWARD)
      );
      expect(screen.getAllByRole('listbox')[1]).toHaveTextContent(
        SeekDirectionOptionsObj[SeekDirection.BACKWARD].label
      );
    });
  });
});
