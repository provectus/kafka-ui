import { ApplicationConfigValidation } from 'generated-sources';
import { showAlert } from 'lib/errorHandling';

export const getIsValidConfig = (
  { clusters }: ApplicationConfigValidation,
  name: string
) => {
  let isValid = true;
  const prefix = `cluster-${name}`;
  const clusterErrors = clusters?.[name];

  if (clusterErrors?.kafka?.error) {
    isValid = false;
    showAlert('error', {
      id: `${prefix}-kafka`,
      title: 'Kafka Cluster',
      message: clusterErrors?.kafka.errorMessage,
    });
  }
  if (clusterErrors?.schemaRegistry?.error) {
    isValid = false;
    showAlert('error', {
      id: `${prefix}-schemaRegistry`,
      title: 'Schema Registry',
      message: clusterErrors?.schemaRegistry.errorMessage,
    });
  }
  if (clusterErrors?.ksqldb?.error) {
    isValid = false;
    showAlert('error', {
      id: `${prefix}-ksqldb`,
      title: 'KSQL DB',
      message: clusterErrors?.ksqldb?.errorMessage,
    });
  }
  if (clusterErrors?.kafkaConnects) {
    Object.entries(clusterErrors.kafkaConnects).forEach(([key, val]) => {
      if (val?.error) {
        isValid = false;
        showAlert('error', {
          id: `${prefix}-kafkaConnects-${key}`,
          title: `Kafka Connect. ${key}`,
          message: val.errorMessage,
        });
      }
    });
  }
  return isValid;
};
