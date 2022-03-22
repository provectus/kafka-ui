import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Settings from 'components/Topics/Topic/Details/Settings/Settings';
import { TopicConfig } from 'generated-sources';

describe('Settings', () => {
  let expectedResult: number;
  const mockFn = jest.fn();
  const mockClusterName = 'Cluster Name';
  const mockTopicName = 'Topic Name';
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

  it('should check it returns null if no config is passed', () => {
    render(
      <Settings
        clusterName={mockClusterName}
        topicName={mockTopicName}
        isFetched
        fetchTopicConfig={mockFn}
      />
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should show Page loader when it is in fetching state and config is given', () => {
    render(
      <Settings
        clusterName={mockClusterName}
        topicName={mockTopicName}
        isFetched={false}
        fetchTopicConfig={mockFn}
        config={mockConfig}
      />
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should check and return null if it is not fetched and config is not given', () => {
    render(
      <Settings
        clusterName={mockClusterName}
        topicName={mockTopicName}
        isFetched={false}
        fetchTopicConfig={mockFn}
      />
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  describe('Settings Component with Data', () => {
    beforeEach(() => {
      expectedResult = mockConfig.length + 1; // include the header table row as well
      render(
        <Settings
          clusterName={mockClusterName}
          topicName={mockTopicName}
          isFetched
          fetchTopicConfig={mockFn}
          config={mockConfig}
        />
      );
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
