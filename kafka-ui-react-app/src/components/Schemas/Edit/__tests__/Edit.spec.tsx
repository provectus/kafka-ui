import { mount, shallow } from 'enzyme';
import { SchemaType } from 'generated-sources';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import Edit, { EditProps } from 'components/Schemas/Edit/Edit';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  Controller: () => 'Controller',
}));

describe('Edit Component', () => {
  const mockSchema = {
    subject: 'Subject',
    version: '1',
    id: 1,
    schema: '{"schema": "schema"}',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.AVRO,
  };

  const setupWrapper = (props: Partial<EditProps> = {}) => (
    <Edit
      subject="Subject"
      clusterName="ClusterName"
      schemasAreFetched
      fetchSchemasByClusterName={jest.fn()}
      updateSchema={jest.fn()}
      schema={mockSchema}
      {...props}
    />
  );

  describe('when schemas are not fetched', () => {
    const component = shallow(setupWrapper({ schemasAreFetched: false }));
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
    it('shows loader', () => {
      expect(component.find('PageLoader').exists()).toBeTruthy();
    });
    it('fetches them', () => {
      const mockFetch = jest.fn();
      mount(
        <ThemeProvider theme={theme}>
          <StaticRouter>
            {setupWrapper({
              schemasAreFetched: false,
              fetchSchemasByClusterName: mockFetch,
            })}
          </StaticRouter>
        </ThemeProvider>
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('when schemas are fetched', () => {
    const component = shallow(setupWrapper());
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
    it('shows editor', () => {
      expect(
        component.find('Styled(JSONEditor)[name="latestSchema"]').length
      ).toEqual(1);
      expect(component.find('Controller').length).toEqual(1);
      expect(component.find('Button').exists()).toBeTruthy();
    });
    it('does not fetch them', () => {
      const mockFetch = jest.fn();
      shallow(setupWrapper());
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });
});
