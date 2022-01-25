import {
  schemaVersion1,
  schemaVersion2,
} from 'redux/reducers/schemas/__test__/fixtures';

export const schemas = [schemaVersion1, schemaVersion2];

export const schemasPayload = {
  pageCount: 1,
  schemas,
};

export const schemasEmptyPayload = {
  pageCount: 1,
  schemas: [],
};
