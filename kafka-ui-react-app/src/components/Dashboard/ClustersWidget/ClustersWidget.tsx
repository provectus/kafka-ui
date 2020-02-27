import React from 'react';
import { chunk } from 'lodash';
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
    },
    [clusters, offlineClusters, showOfflineOnly],
  );

  const handleSwitch = () => setShowOfflineOnly(!showOfflineOnly);

  return (
    <div>
      <h5 className="title is-5">
        Clusters
      </h5>

      <MetricsWrapper>
        <Indicator label="Online Clusters" >
          <span className="tag is-primary">
            {onlineClusters.length}
          </span>
        </Indicator>
        <Indicator label="Offline Clusters">
          <span className="tag is-danger">
            {offlineClusters.length}
          </span>
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
          <label htmlFor="switchRoundedDefault">
          </label>
        </Indicator>
      </MetricsWrapper>

      {clusterList.map((chunk, idx) => (
        <div className="columns" key={`dashboard-cluster-list-row-key-${idx}`}>
          {chunk.map((cluster, idx) => (
            <ClusterWidget {...cluster} key={`dashboard-cluster-list-item-key-${idx}`}/>
          ))}
        </div>
      ))}
    </div>
  )
};

export default ClustersWidget;
