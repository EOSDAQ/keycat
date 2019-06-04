import React, { Suspense } from 'react';
import styled from 'styled-components';
import { media } from 'design/utils';
import { Router, Location } from '@reach/router';
import GlobalStyle from 'design/GlobalStyle';
import { updatePageView } from 'utils/ga';
import EosPlayground from './__test/EosPlayground';
import About from './about/About';

const Signin = React.lazy(() => import(/* webpackPrefetch: true */ './signin/Signin'))
const Register = React.lazy(() => import(/* webpackPrefetch: true */ './register/Register'))
const Keychain = React.lazy(() => import(/* webpackPrefetch: true */ './register/Keychain'))
const Transact = React.lazy(() => import(/* webpackPrefetch: true */ './transact/Transact'))
const Support = React.lazy(() => import(/* webpackPrefetch: true */ './support/Support'))
const Playground = React.lazy(() => import(/* webpackPrefetch: true */ './playground/Playground'))

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;

  --padding-x: 20px;
  --primary-color: #083ADE;

  ${media.greaterThan('601px')`
    &:before, &:after {
      content: '';
      height: 24px;
      flex: 1 1;
    }
  `}
`

const App = () => {
  const { origin } = location
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Suspense fallback={<div />}>
          <Router>
            <About path="/" />
            <Signin path="/signin" />
            <Playground path="/playground" />
            <EosPlayground path="/playground/eos" />
            <Support path="/support" />
            <Transact path="/transact" />
            <Register path="/register" />
            <Keychain path="/register/keychain" />
          </Router>
        </Suspense>
        <Location>
          {({ location }) => {
            updatePageView(location.pathname)
          }}
        </Location>
      </AppContainer>
    </>
  )
}

export default App
