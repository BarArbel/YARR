import React from 'react'
import { BrowserRouter as Router, Route  } from 'react-router-dom'
import { Provider } from 'react-redux'
import Login from '../Components/Login'
import HomePage from '../Components/HomePage'
import ExperimentBuilder from '../Components/Experiment/ExperimentBuilder'

// const path = window.location.pathname

const ReactRouter = ({ store }) => (
    <Provider store = {store}>
        <Router>
            {/* <Route exact path = {path} component = {App}/> */}
            <Route exact path = "/" component = {Login}/>
            <Route exact path = "/homePage" component = {HomePage}/>
            <Route exact path = "/experimentBuilder" component = {ExperimentBuilder}/>
        </Router>
    </Provider>
)

export default ReactRouter