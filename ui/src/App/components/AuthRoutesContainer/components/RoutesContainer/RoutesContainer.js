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
import RealitiesNavbar from './components/RealitiesNavbar';
import RealitiesFooter from './components/RealitiesFooter';

const RoutesContainer = () => (
  <Router history={history}>
    <div>
      <RealitiesNavbar />
      <Switch>
        <Route exact path="/about" component={About} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/profile/:personId" component={UserProfile} />
        <Route path="/:tagId?/:responsibilityId?" component={Home} />
      </Switch>
      <RealitiesFooter />
    </div>
  </Router>
);

export default RoutesContainer;
