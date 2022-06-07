import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Settings, {
  Props,
} from 'components/Topics/Topic/Details/Settings/Settings';
import { TopicConfig } from 'generated-sources';
import { clusterTopicSettingsPath } from 'lib/paths';
import { getTopicStateFixtures } from 'redux/reducers/topics/__test__/fixtures';

describe('Settings', () => {
  const mockClusterName = 'Cluster_Name';
  const mockTopicName = 'Topic_Name';

  let expectedResult: number;
  const mockFn = jest.fn();

  const mockConfig: TopicConfig[] = [
    {
      name: 'first',
      value: 'first-value-name',
    },
    {
      name: 'second',
      value: 'second-value-name',
    },
  ];

  const setUpComponent = (
    props: Partial<Props> = {},
    config?: TopicConfig[]
  ) => {
    const topic = {
      name: mockTopicName,
      config,
    };
    const topics = getTopicStateFixtures([topic]);

    return render(
      <WithRoute path={clusterTopicSettingsPath()}>
        <Settings isFetched fetchTopicConfig={mockFn} {...props} />
      </WithRoute>,
      {
        initialEntries: [
          clusterTopicSettingsPath(mockClusterName, mockTopicName),
        ],
        preloadedState: {
          topics,
        },
      }
    );
  };

  afterEach(() => {
    mockFn.mockClear();
  });

  it('should check it returns null if no config is passed', () => {
    setUpComponent();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should show Page loader when it is in fetching state and config is given', () => {
    setUpComponent({ isFetched: false }, mockConfig);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should check and return null if it is not fetched and config is not given', () => {
    setUpComponent({ isFetched: false });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  describe('Settings Component with Data', () => {
    beforeEach(() => {
      expectedResult = mockConfig.length + 1; // include the header table row as well
      setUpComponent({ isFetched: true }, mockConfig);
    });

    it('should view the correct number of table row with header included elements after config fetching', () => {
      expect(screen.getAllByRole('row')).toHaveLength(expectedResult);
    });

    it('should view the correct number of table row in tbody included elements after config fetching', () => {
      expectedResult = mockConfig.length;
      const tbodyElement = screen.getAllByRole('rowgroup')[1]; // pick tbody
      const tbodyTableRowsElements = tbodyElement.children;
      expect(tbodyTableRowsElements).toHaveLength(expectedResult);
    });
  });
});
