import { useAppConfig } from 'lib/hooks/api/appConfig';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterNameRoute } from 'lib/paths';
import React from 'react';

import WizardForm from './WizardForm/WizardForm';

const ClusterConfig: React.FC = () => {
  const config = useAppConfig();
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const currentClusterConfig = React.useMemo(() => {
    if (config.isSuccess && !!config.data.properties?.kafka?.clusters) {
      return config.data.properties?.kafka?.clusters?.find(
        ({ name }) => name === clusterName
      );
    }

    return undefined;
  }, [clusterName, config]);

  if (!currentClusterConfig) {
    return null;
  }

  return <WizardForm />;
};

export default ClusterConfig;
