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
      <h5 className="title is-5">Clusters</h5>

      <MetricsWrapper>
        <Indicator label="Online Clusters">
          <span className="tag is-primary">{onlineClusters.length}</span>
        </Indicator>
        <Indicator label="Offline Clusters">
          <span className="tag is-danger">{offlineClusters.length}</span>
        </Indicator>
        <Indicator label="Hide online clusters">
          <input
            type="checkbox"
            className="switch is-rounded"
            name="switchRoundedDefault"
            id="switchRoundedDefault"
            checked={showOfflineOnly}
            onChange={handleSwitch}
          />
          <label htmlFor="switchRoundedDefault" />
        </Indicator>
      </MetricsWrapper>

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
