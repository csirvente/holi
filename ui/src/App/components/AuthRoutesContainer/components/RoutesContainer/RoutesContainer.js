import React from 'react';
import {
  Router,
  Route,
  Switch,
} from 'react-router-dom';
import history from '@/services/history';
import Home from '@/scenes/Home';
import About from '@/scenes/About';
import Profile from '@/scenes/Profile';
import UserProfile from '@/scenes/UserProfile';
import AppNavbar from './components/AppNavbar';
import AppFooter from './components/AppFooter';

const RoutesContainer = () => (
  <Router history={history}>
    <div>
      <AppNavbar />
      <Switch>
        <Route exact path="/about" component={About} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/profile/:personId" component={UserProfile} />
        <Route path="/:tagId?" component={Home} />
      </Switch>
      <AppFooter />
    </div>
  </Router>
);

export default RoutesContainer;
