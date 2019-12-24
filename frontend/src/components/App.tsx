import React from 'react';
import {
  Switch,
  Route,
  NavLink,
} from 'react-router-dom';
import './App.scss';
import TopicsContainer from './Topics/TopicsContainer';

const App: React.FC = () => {
  const [expandedNavbar, setExpandedNavbar] = React.useState<boolean>(false);
  const toggleNavbar = () => setExpandedNavbar(!expandedNavbar);

  return (
    <div className="Layout">
      <aside className={`Layout__navbar ${expandedNavbar && 'Layout__navbar--expanded'}`}>
        <header className="Layout__logo">
          Kafka UI
        </header>
        <div className="menu">
          <ul className="menu-list">
            <li>
              <NavLink exact to="/" activeClassName="is-active">
                <i className="fas fa-tachometer-alt Layout__navbarIcon"></i>
                <span className="Layout__navbarText">
                  Dashboard
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/topics" activeClassName="is-active">
                <i className="fas fa-stream Layout__navbarIcon"></i>
                <span className="Layout__navbarText">
                  Topics
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
      <main className="Layout__container">
        <nav className="Layout__header navbar">
          <div className="navbar-item">
            <a title="Collapse" href="#" onClick={toggleNavbar}>
              <span className="icon">
                <i className="icon fas fa-bars"></i>
              </span>
            </a>
          </div>
        </nav>
        <div className="Layout__content">
          <Switch>
            <Route path="/topics" component={TopicsContainer} />
            <Route exact path="/">
              Dashboard
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  );
}

export default App;
