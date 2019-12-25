import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import './App.scss';
import TopicsContainer from './Topics/TopicsContainer';
import NavConatiner from './Nav/NavConatiner';
import PageLoader from './common/PageLoader/PageLoader';

interface AppProps {
  isClusterListFetched: boolean;
  fetchClustersList: () => void;
}

const App: React.FC<AppProps> = ({
  isClusterListFetched,
  fetchClustersList,
}) => {
  React.useEffect(() => { fetchClustersList() }, [fetchClustersList]);

  return (
    <div className="Layout">
      <nav className="navbar is-fixed-top is-white Layout__header" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item title is-5 is-marginless" href="/">
            Kafka UI
          </a>
        </div>
      </nav>
      <main className="Layout__container">
        <NavConatiner className="Layout__navbar" />
        {isClusterListFetched ? (
          <section className="section">
            <Switch>
              <Route path="/clusters/:clusterId/topics" component={TopicsContainer} />
              <Route exact path="/">
                Dashboard
              </Route>
            </Switch>
          </section>
        ) : (
          <PageLoader />
        )}

      </main>
    </div>
  );
}

export default App;
