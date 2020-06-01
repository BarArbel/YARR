import React from 'react'
import { Provider } from 'react-redux'
import Login from '../Components/Login'
import HomePage from '../Components/HomePage'
import StudyPage from '../Components/Study/StudyPage'
import CustomSnackbar from '../Components/Utilities/CustomSnackbar'
import ExperimentPage from '../Components/Experiment/ExperimentPage'
import StudyInsightRadar from '../Components/Insights/StudyInsightsRadar'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

/* todo -> create a 404 component */
const ReactRouter = ({ store }) => (
  <Provider store = {store}>
    <CustomSnackbar />
    <Router>
      <Switch>
        <Route exact path = "/" component = {Login} />
        <Route exact path = "/homePage" component = {HomePage} />
        <Route exact path = "/study/:studyId" component={StudyPage} />
        <Route exact path = "/study/:studyId/experiment/:experimentId" component={ExperimentPage} />
        <Route exact path = "/testing" component={StudyInsightRadar} />
        <Route component={Login} />
      </Switch>
    </Router>
  </Provider>
)

export default ReactRouter