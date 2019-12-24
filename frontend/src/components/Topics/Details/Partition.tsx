import React from 'react';
import { TopicPartition } from 'types';
import Replica from './Replica';

const Partition: React.FC<TopicPartition> = ({
  partition,
  leader,
  replicas,
}) => {
  return (
    <div className="tile is-child box">
      <h2 className="title is-5">Partition #{partition}</h2>

      <div className="columns is-mobile is-multiline">
        {replicas.map((replica, index) => <Replica {...replica} index={index} />)}
      </div>

    </div>
  );
};

export default Partition;
