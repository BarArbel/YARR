import React from 'react'
import { BrowserRouter as Router, Route  } from 'react-router-dom'
import { Provider } from 'react-redux'
import Login from '../Components/Login'
import HomePage from '../Components/HomePage'
import ExperimentPage from '../Components/Experiment/ExperimentPage'
import StudyPage from '../Components/Study/StudyPage'
// const path = window.location.pathname

const ReactRouter = ({ store }) => (
  <Provider store = {store}>
    <Router>
      <Route exact path = "/" component = {Login}/>
      <Route exact path = "/homePage" component = {HomePage}/>
      <Route exact path= "/study/:studyId" component={StudyPage}/>
      <Route exact path= "/study/:studyId/experiment/:experimentId" component={ExperimentPage} />
    </Router>
  </Provider>
)

export default ReactRouter