import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  withRouter,
} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import { Login } from './user/presentation/Login';
import { Register } from './user/presentation/Register';
import { PrivateRoute, PublicRoute } from './core/presentation/Routes';
import { RegisterConfirmation } from './user/presentation/RegisterConfirmation';
import { Confirm } from './user/presentation/Confirm';
import { Dashboard } from './menstruation/presentation/Dashboard';
import { Create } from './menstruation/presentation/Create';
import { ProfileMenu } from './user/presentation/ProfileMenu';
import { Delete } from './user/presentation/Delete';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <header>
        <Link className="logo" to="/">
          Menstra
        </Link>
        <ProfileMenu />
      </header>
      <main>
        <PrivateRoute
          path="/"
          exact
          component={() => <Redirect to="/dashboard" />}
        />
        <PrivateRoute
          path="/dashboard"
          exact
          component={withRouter(Dashboard)}
        />
        <PrivateRoute path="/create" exact component={withRouter(Create)} />
        <PrivateRoute path="/profile/delete" exact component={Delete} />
        <PublicRoute path="/login" exact component={Login} />
        <PublicRoute path="/register" exact component={withRouter(Register)} />
        <PublicRoute
          path="/register/confirmation"
          exact
          component={withRouter(RegisterConfirmation)}
        />
        <PublicRoute
          path="/register/confirm"
          exact
          component={withRouter(Confirm)}
        />
      </main>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
