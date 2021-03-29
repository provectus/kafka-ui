import { shallow } from 'enzyme';
import { SchemaType } from 'generated-sources';
import React from 'react';
import Edit from '../Edit';

describe('Edit Component', () => {
  const mockSchema = {
    subject: 'Subject',
    version: '1',
    id: 1,
    schema: '{"schema": "schema"}',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.AVRO,
  };

  describe('when schemas are not fetched', () => {
    const component = shallow(
      <Edit
        subject="Subject"
        clusterName="ClusterName"
        schemasAreFetched={false}
        fetchSchemasByClusterName={jest.fn()}
        createSchema={jest.fn()}
        schema={mockSchema}
      />
    );
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
    it('shows loader', () => {
      expect(component.find('PageLoader').exists()).toBeTruthy();
    });
  });

  describe('when schemas are fetched', () => {
    const component = shallow(
      <Edit
        subject="Subject"
        clusterName="ClusterName"
        schemasAreFetched
        fetchSchemasByClusterName={jest.fn()}
        createSchema={jest.fn()}
        schema={mockSchema}
      />
    );
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
    it('shows editor', () => {
      expect(component.find('JSONEditor').length).toEqual(2);
      expect(component.find('button').exists()).toBeTruthy();
    });
    it('calls createSchema on button click', () => {
      const mockCreateSchema = jest.fn();
      const componentWithMockFn = shallow(
        <Edit
          subject="Subject"
          clusterName="ClusterName"
          schemasAreFetched
          fetchSchemasByClusterName={jest.fn()}
          createSchema={mockCreateSchema}
          schema={mockSchema}
        />
      );
      componentWithMockFn.find('button').simulate('click');
      expect(mockCreateSchema).toHaveBeenCalledWith('ClusterName', {
        ...mockSchema,
        schema: '',
      });
      expect(mockCreateSchema).toHaveBeenCalledTimes(1);
    });
  });
});
