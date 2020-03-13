import React from 'react'
import { BrowserRouter as Router, Route  } from 'react-router-dom'
import { Provider } from 'react-redux'
import Login from '../Components/Login'
import HomePage from '../Components/HomePage'
import App from '../App'

// const path = window.location.pathname

const ReactRouter = ({ store }) => (
    <Provider store = {store}>
        <Router>
            {/* <Route exact path = {path} component = {App}/> */}
            <Route exact path = "/" component = {Login}/>
            <Route exact path = "/homePage" component = {HomePage}/>
        </Router>
    </Provider>
)

export default ReactRouter