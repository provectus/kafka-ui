import { mount, shallow } from 'enzyme';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaType,
} from 'generated-sources';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import Edit, { EditProps } from '../Edit';

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
        <StaticRouter>
          {setupWrapper({
            schemasAreFetched: false,
            fetchSchemasByClusterName: mockFetch,
          })}
        </StaticRouter>
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
      expect(component.find('JSONEditor').length).toEqual(2);
      expect(component.find('button').exists()).toBeTruthy();
    });
    xit('calls updateSchema on button click', () => {
      const mockUpdateSchema = jest.fn();
      const componentWithMockFn = shallow(
        setupWrapper({ updateSchema: mockUpdateSchema })
      );
      componentWithMockFn.find('button').simulate('submit');
      expect(mockUpdateSchema).toHaveBeenCalledTimes(1);
    });
    it('does not fetch them', () => {
      const mockFetch = jest.fn();
      shallow(setupWrapper());
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });
});
