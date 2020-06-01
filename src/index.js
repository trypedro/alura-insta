import React from 'react';
import ReactDOM from 'react-dom';
import './css/reset.css';
import './css/timeline.css';
import './css/login.css';
import Login from './components/Login';
import Logout from './components/Logout';
import App from './App';

import { Router, Route, browserHistory } from 'react-router'
import { matchPattern } from 'react-router/lib/PatternUtils'


function verificaAutenticacao(nextState, replace){

  console.log(nextState)

  const resultado = matchPattern('/timeline(/:login)', nextState.location.pathname);
  const enderecoPrivadoTimeline = resultado.paramValues[0] === undefined;

  if(enderecoPrivadoTimeline && localStorage.getItem('auth-token') === null){
    replace('/?msg=Voce precisa estar logado.');
  }

}

ReactDOM.render(
  (
    <Router history={browserHistory}>
      <Route path="/" component={Login} />
      <Route path="/timeline(/:login)" component={App} onEnter={verificaAutenticacao} />
      <Route path="/logout" component={Logout} />
    </Router>
  ),
  document.getElementById('root')
);