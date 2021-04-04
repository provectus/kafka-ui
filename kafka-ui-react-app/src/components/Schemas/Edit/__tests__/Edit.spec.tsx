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
        updateSchemaCompatibilityLevel={jest.fn()}
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
        updateSchemaCompatibilityLevel={jest.fn()}
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
    it('does not call createSchema on button click without changing the schema', () => {
      const mockCreateSchema = jest.fn();
      const componentWithMockFn = shallow(
        <Edit
          subject="Subject"
          clusterName="ClusterName"
          schemasAreFetched
          fetchSchemasByClusterName={jest.fn()}
          updateSchemaCompatibilityLevel={jest.fn()}
          createSchema={mockCreateSchema}
          schema={mockSchema}
        />
      );
      componentWithMockFn.find('button').simulate('click');
      expect(mockCreateSchema).toHaveBeenCalledTimes(0);
    });
    it('does not call updateSchemaCompatibilityLevel on button click without changing the compatibility level', () => {
      const mockupdateSchemaCompatibilityLevel = jest.fn();
      const componentWithMockFn = shallow(
        <Edit
          subject="Subject"
          clusterName="ClusterName"
          schemasAreFetched
          fetchSchemasByClusterName={jest.fn()}
          updateSchemaCompatibilityLevel={mockupdateSchemaCompatibilityLevel}
          createSchema={jest.fn()}
          schema={mockSchema}
        />
      );
      componentWithMockFn.find('button').simulate('click');
      expect(mockupdateSchemaCompatibilityLevel).toHaveBeenCalledTimes(0);
    });
    it('does not fetch them', () => {
      const mockFetch = jest.fn();
      shallow(
        <Edit
          subject="Subject"
          clusterName="ClusterName"
          schemasAreFetched
          fetchSchemasByClusterName={mockFetch}
          updateSchemaCompatibilityLevel={jest.fn()}
          createSchema={jest.fn()}
          schema={mockSchema}
        />
      );
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });
});
