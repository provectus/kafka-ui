import React from 'react';
import { chunk } from 'lodash';
import { v4 } from 'uuid';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import { Cluster } from 'generated-sources';

import ClusterWidget from './ClusterWidget';

interface Props {
  clusters: Cluster[];
  onlineClusters: Cluster[];
  offlineClusters: Cluster[];
}

interface ChunkItem {
  id: string;
  data: Cluster[];
}

const ClustersWidget: React.FC<Props> = ({
  clusters,
  onlineClusters,
  offlineClusters,
}) => {
  const [showOfflineOnly, setShowOfflineOnly] = React.useState<boolean>(false);

  const clusterList: ChunkItem[] = React.useMemo(() => {
    let list = clusters;

    if (showOfflineOnly) {
      list = offlineClusters;
    }

    return chunk(list, 2).map((data) => ({
      id: v4(),
      data,
    }));
  }, [clusters, offlineClusters, showOfflineOnly]);

  const handleSwitch = () => setShowOfflineOnly(!showOfflineOnly);

  return (
    <div>
      <div className="metrics-box mb-2">
        <MetricsWrapper>
          <Indicator
            label={<span className="tag is-success">Online</span>}
            className="is-justify-content-start"
          >
            <span data-testid="onlineCount">{onlineClusters.length}</span>{' '}
            <span className="has-text-grey-light is-size-8">cluster</span>
          </Indicator>
          <Indicator
            label={<span className="tag is-light">Offline</span>}
            className="is-justify-content-start"
          >
            <span data-testid="offlineCount">{offlineClusters.length}</span>{' '}
            <span className="has-text-grey-light is-size-8">cluster</span>
          </Indicator>
        </MetricsWrapper>
      </div>
      <div className="p-4">
        <input
          type="checkbox"
          className="switch is-rounded"
          name="switchRoundedDefault"
          id="switchRoundedDefault"
          checked={showOfflineOnly}
          onChange={handleSwitch}
        />
        <label htmlFor="switchRoundedDefault" />
        <span className="is-size-7">Show only offline clusters</span>
      </div>
      {clusterList.map((chunkItem) => (
        <div className="columns" key={chunkItem.id}>
          {chunkItem.data.map((cluster) => (
            <ClusterWidget cluster={cluster} key={cluster.name} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ClustersWidget;
