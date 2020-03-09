import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from '../App'

// const path = window.location.pathname

const ReactRouter = ({ store }) => (
    <Provider store = {store}>
        <Router>
            {/* <Route exact path = {path} component = {App}/> */}
            <Route exact path = "/" component = {App}/>
        </Router>
    </Provider>
)

export default ReactRouter