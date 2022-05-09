import type { ClusterConfiguration } from './lib/clusterConfigurationSchema';
import { derived, writable } from 'svelte/store';

const LOCAL_STORAGE_KEY = 'uiForApacheKafkaWizard';
export interface State {
  isValid: boolean;
  isEditing: boolean;
  config: ClusterConfiguration;
}

const newClusterValue: State = {
    isValid: false,
    isEditing: true,
    config: {
      clusterName: "",
      readonly: false,
      bootstrapServers: [
        {
          host: "",
          port: undefined,
        },
      ],
      sharedConfluentCloudCluster: false,
      securedWithSSL: false,
      selfSignedCA: false,
      selfSignedCATruststoreLocation: undefined,
      selfSignedCATruststorePassword: undefined,
      authMethod: "None",
      saslJaasConfig: undefined,
      saslMechanism: undefined,
      sslTruststoreLocation: undefined,
      sslTruststorePassword: undefined,
      sslKeystoreLocation: undefined,
      sslKeystorePassword: undefined,
      useSpecificIAMProfile: false,
      IAMProfile: undefined,
      schemaRegistryEnabled: false,
      schemaRegistryURL: undefined,
      schemaRegistrySecuredWithAuth: false,
      schemaRegistryUsername: undefined,
      schemaRegistryPassword: undefined,
      kafkaConnectEnabled: false,
      kafkaConnectURL: undefined,
      kafkaConnectSecuredWithAuth: false,
      kafkaConnectUsername: undefined,
      kafkaConnectPassword: undefined,
      jmxEnabled: false,
      jmxPort: undefined,
      jmxSSL: false,
      jmxSSLTruststoreLocation: undefined,
      jmxSSLTruststorePassword: undefined,
      jmxSSLKeystoreLocation: undefined,
      jmxSSLKeystorePassword: undefined,
      jmxSecuredWithAuth: false,
      jmxUsername: undefined,
      jmxPassword: undefined,
    },
  };

const store = (initialValue: State[]) => {
  const { update, subscribe } = writable<State[]>(initialValue);

  return {
    subscribe,
    addNew: () => update((items) => [
      ...items.map((val) => ({ ...val, isEditing: false })),
      newClusterValue,
    ]),
    copy: (id: number) => update((items) => {
      const copiedItem: State = {
        ...items[id],
        isEditing: true,
        isValid: false,
      };

      return [
        ...items.map((item) => ({ ...item, isEditing: false })),
        copiedItem
      ];
    }),
    review: (id: number) =>
      update((items) => items.map((item, index) => ({ ...item, isEditing: index === id }))),
    remove: (id: number) =>
      update((items) => items.filter((_, index) => index !== id)),
    submit: (id: number, config: State['config']) => update((items) => {
      items[id] = {
        isValid: true,
        isEditing: false,
        config,
      }
      return [...items];
    }),
  };
};


const stored: State[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
export const appStore = store(stored);

appStore.subscribe((value) => {
  localStorage[LOCAL_STORAGE_KEY] = JSON.stringify(value);
});

export const allValid = derived(appStore, (items) => !items.find(({ isValid }) => !isValid));
export const editableConfigID = derived(appStore, (items) => items.findIndex(({ isEditing }) => isEditing));
