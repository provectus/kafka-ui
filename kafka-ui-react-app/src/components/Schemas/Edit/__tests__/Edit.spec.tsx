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
  it('matches the snapshot', () => {
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
    expect(component).toMatchSnapshot();
  });

  it('shows loader when schemas are not fetched', () => {
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
    expect(component.find('PageLoader').exists()).toBeTruthy();
  });

  it('calls createSchema on button click', () => {
    const mockCreateSchema = jest.fn();
    const component = shallow(
      <Edit
        subject="Subject"
        clusterName="ClusterName"
        schemasAreFetched
        fetchSchemasByClusterName={jest.fn()}
        createSchema={mockCreateSchema}
        schema={mockSchema}
      />
    );
    component.find('button').simulate('click');
    expect(mockCreateSchema).toHaveBeenCalledWith('ClusterName', {
      ...mockSchema,
      schema: '',
    });
    expect(mockCreateSchema).toHaveBeenCalledTimes(1);
  });
});
