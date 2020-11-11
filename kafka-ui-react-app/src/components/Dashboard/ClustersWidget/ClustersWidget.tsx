import React from 'react';
import { chunk } from 'lodash';
import { v4 } from 'uuid';
import { Cluster } from 'redux/interfaces';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import ClusterWidget from './ClusterWidget';

interface Props {
  clusters: Cluster[];
  onlineClusters: Cluster[];
  offlineClusters: Cluster[];
}

const ClustersWidget: React.FC<Props> = ({
  clusters,
  onlineClusters,
  offlineClusters,
}) => {
  const [showOfflineOnly, setShowOfflineOnly] = React.useState<boolean>(false);

  const clusterList: Array<Cluster[]> = React.useMemo(() => {
    let list = clusters;

    if (showOfflineOnly) {
      list = offlineClusters;
    }

    return chunk(list, 2);
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
        <div className="columns" key={v4()}>
          {chunkItem.map((cluster) => (
            <ClusterWidget cluster={cluster} key={cluster.id} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ClustersWidget;
