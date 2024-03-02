import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, EventSourceMock, WithRoute } from 'lib/testHelpers';
import Messages from 'components/Topics/Topic/Messages/Messages';
import { PollingMode } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import { clusterTopicMessagesPath } from 'lib/paths';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import { serdesPayload } from 'lib/fixtures/topicMessages';
import { useTopicDetails } from 'lib/hooks/api/topics';
import { externalTopicPayload } from 'lib/fixtures/topics';
import { PollingModeOptions, PollingModeOptionsObj } from 'lib/constants';

jest.mock('lib/hooks/api/topicMessages', () => ({
  useSerdes: jest.fn(),
}));

jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
  useRegisterFilter: jest.fn(),
}));

describe('Messages', () => {
  const searchParams = `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&pollingMode=${PollingMode.LATEST}`;
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
    (useSerdes as jest.Mock).mockImplementation(() => ({
      data: serdesPayload,
    }));
    (useTopicDetails as jest.Mock).mockImplementation(() => ({
      data: externalTopicPayload,
    }));
  });
  describe('component rendering default behavior with the search params', () => {
    beforeEach(() => {
      renderComponent();
    });
    it('should check default PollingMode if it actually take the value from the url', () => {
      expect(screen.getAllByRole('listbox')[0]).toHaveTextContent(
        PollingModeOptionsObj[PollingMode.LATEST].label
      );
    });

    it('should check the PollingMode select changes with live option', async () => {
      const pollingModeSelect = screen.getAllByRole('listbox')[0];
      const pollingModeOption = screen.getAllByRole('option')[0];

      expect(pollingModeOption).toHaveTextContent(
        PollingModeOptionsObj[PollingMode.LATEST].label
      );

      const labelValue1 = PollingModeOptions[1].label;
      await userEvent.click(pollingModeSelect);
      await userEvent.selectOptions(pollingModeSelect, [labelValue1]);
      expect(pollingModeOption).toHaveTextContent(labelValue1);

      const labelValue0 = PollingModeOptions[0].label;
      await userEvent.click(pollingModeSelect);
      await userEvent.selectOptions(pollingModeSelect, [labelValue0]);
      expect(pollingModeOption).toHaveTextContent(labelValue0);

      const liveOptionConf = PollingModeOptions[2];
      const labelValue2 = liveOptionConf.label;
      await userEvent.click(pollingModeSelect);

      const options = screen.getAllByRole('option');
      const liveModeLi = options.find(
        (option) => option.getAttribute('value') === liveOptionConf.value
      );
      expect(liveModeLi).toBeInTheDocument();
      if (!liveModeLi) return; // to make TS happy
      await userEvent.selectOptions(pollingModeSelect, [liveModeLi]);
      expect(pollingModeOption).toHaveTextContent(labelValue2);

      await waitFor(() => {
        expect(screen.getByRole('contentLoader')).toBeInTheDocument();
      });
    });
  });

  describe('Component rendering with custom Url search params', () => {
    it('reacts to a change of pollingMode in the url which make the select pick up different value', () => {
      renderComponent(
        searchParams.replace(PollingMode.LATEST, PollingMode.EARLIEST)
      );
      expect(screen.getAllByRole('listbox')[0]).toHaveTextContent(
        PollingModeOptionsObj[PollingMode.EARLIEST].label
      );
    });
  });
});
