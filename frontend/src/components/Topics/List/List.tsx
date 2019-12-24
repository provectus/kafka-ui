import React from 'react';
import { Topic } from 'types';
import { NavLink } from 'react-router-dom';

const ListItem: React.FC<Topic> = ({
  name,
  partitions,
}) => {
  return (
    <li className="tile is-child box">
      <NavLink exact to={`/topics/${name}`} activeClassName="is-active" className="title is-6">
        {name} <i className="fas fa-arrow-circle-right has-text-link"></i>
      </NavLink>
      <p>Partitions: {partitions.length}</p>
      <p>Replications: {partitions ? partitions[0].replicas.length : 0}</p>
    </li>
  );
}

interface Props {
  topics: Topic[];
  totalBrokers?: number;
}

const List: React.FC<Props> = ({
  topics,
  totalBrokers,
}) => {
  return (
    <>
      <section className="hero is-info is-bold">
        <div className="hero-body">
          <div className="level has-text-white is-mobile">
            <div className="level-item has-text-centered ">
              <div>
                <p className="heading">Brokers</p>
                <p className="title has-text-white">{totalBrokers}</p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Topics</p>
                <p className="title has-text-white">{topics.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container is-fluid">
        <ul className="tile is-parent is-vertical">
          {topics.map((topic) => <ListItem {...topic} key={topic.name} />)}
        </ul>
      </div>
    </>
  );
}

export default List;
