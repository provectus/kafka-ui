import configureStore from 'redux/store/configureStore';
import * as selectors from 'redux/reducers/topicMessages/selectors';
import { initialState } from 'redux/reducers/topicMessages/reducer';

const store = configureStore();

describe('TopicMessages selectors', () => {
  describe('Initial state', () => {
    it('returns schema list', () => {
      expect(selectors.getTopicMessges(store.getState())).toEqual([]);
    });

    it('returns undefined schema', () => {
      expect(selectors.getTopicMessgesPhase(store.getState())).toBeUndefined();
    });

    it('returns sorted versions of schema', () => {
      expect(selectors.getTopicMessgesMeta(store.getState())).toEqual(
        initialState.meta
      );
    });
  });

  // describe('state', () => {
  //   beforeAll(() => {
  //     store.dispatch(
  //       fetchSchemasByClusterNameAction.success(clusterSchemasPayload)
  //     );
  //     store.dispatch(fetchSchemaVersionsAction.success(schemaVersionsPayload));
  //     store.dispatch(createSchemaAction.success(newSchemaPayload));
  //     store.dispatch(
  //       fetchGlobalSchemaCompatibilityLevelAction.success(
  //         CompatibilityLevelCompatibilityEnum.BACKWARD
  //       )
  //     );
  //   });

  //   it('returns fetch status', () => {
  //     expect(selectors.getIsSchemaListFetched(store.getState())).toBeTruthy();
  //     expect(
  //       selectors.getIsSchemaVersionFetched(store.getState())
  //     ).toBeTruthy();
  //     expect(selectors.getSchemaCreated(store.getState())).toBeTruthy();
  //     expect(
  //       selectors.getGlobalSchemaCompatibilityLevelFetched(store.getState())
  //     ).toBeTruthy();
  //   });

  //   it('returns schema list', () => {
  //     expect(selectors.getSchemaList(store.getState())).toEqual(
  //       clusterSchemasPayloadWithNewSchema
  //     );
  //   });

  //   it('returns schema', () => {
  //     expect(selectors.getSchema(store.getState(), 'test2')).toEqual(
  //       clusterSchemasPayload[0]
  //     );
  //   });

  //   it('returns ordered versions of schema', () => {
  //     expect(selectors.getSortedSchemaVersions(store.getState())).toEqual(
  //       orderBy(schemaVersionsPayload, 'id', 'desc')
  //     );
  //   });

  //   it('return registry compatibility level', () => {
  //     expect(
  //       selectors.getGlobalSchemaCompatibilityLevel(store.getState())
  //     ).toEqual(CompatibilityLevelCompatibilityEnum.BACKWARD);
  //   });
  // });
});
