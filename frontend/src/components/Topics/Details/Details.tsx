import React from 'react';
import { Topic } from 'types';
import ConfigRow from './ConfigRow';
import Partition from './Partition';

const Details: React.FC<{ topic: Topic }> = ({
  topic: {
    name,
    configs,
    partitions,
  }
}) => {
  const configKeys = Object.keys(configs);

  return (
    <>
      <section className="hero is-info is-bold">
        <div className="hero-body">
          <div className="level has-text-white">
            <div className="level-item level-left">
              <div>
                <p className="heading">Name</p>
                <p className="title has-text-white">{name}</p>
              </div>
            </div>
            <div className="level-item level-left  has-text-centered ">
              <div>
                <p className="heading">Partitions</p>
                <p className="title has-text-white">{partitions.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container is-fluid">
        <div className="tile is-parent">

          <div className="tile is-parent is-7 is-vertical is-narrow">
            {partitions.map((partition) => <Partition {...partition} />)}
          </div>

          <div className="tile is-parent">
            <div className="tile is-child box">
              <h2 className="title is-5">Config</h2>
              <table className="table is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {configKeys.map((key) => <ConfigRow name={key} key={key} value={configs[key]} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Details;
