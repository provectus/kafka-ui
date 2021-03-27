import { shallow } from 'enzyme';
import { SchemaType } from 'generated-sources';
import React from 'react';
import Edit from '../Edit';

describe('Edit Component', () => {
  it('matches the snapshot', () => {
    const component = shallow(
      <Edit
        subject="Subject"
        clusterName="ClusterName"
        schemasAreFetched
        fetchSchemasByClusterName={jest.fn()}
        createSchema={jest.fn()}
        schema={{
          subject: 'Subject',
          version: '1',
          id: 1,
          schema: '{"schema": "schema"}',
          compatibilityLevel: 'BACKWARD',
          schemaType: SchemaType.AVRO,
        }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
