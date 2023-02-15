import React from 'react';
import { useAppConfig } from 'lib/hooks/api/appConfig';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterNameRoute } from 'lib/paths';

import { getInitialFormData } from './utils/getInitialFormData';
import WizardForm from './WizardForm/WizardForm';

const ClusterConfig: React.FC = () => {
  const config = useAppConfig();
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const currentClusterConfig = React.useMemo(() => {
    if (config.isSuccess && !!config.data.properties?.kafka?.clusters) {
      const current = config.data.properties?.kafka?.clusters?.find(
        ({ name }) => name === clusterName
      );
      if (current) {
        return getInitialFormData(current);
      }
    }
    return undefined;
  }, [clusterName, config]);

  if (!currentClusterConfig) {
    return null;
  }

  const hasCustomConfig = Object.values(currentClusterConfig.customAuth).some(
    (v) => !!v
  );

  return (
    <WizardForm
      initialValues={currentClusterConfig}
      hasCustomConfig={hasCustomConfig}
    />
  );
};

export default ClusterConfig;
