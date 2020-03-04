import React from 'react'
import { Route } from 'react-router-dom'
import App from '../App'

const path = window.location.pathname

const ReactRouter = () => {
    return (
        <React.Fragment>
            <Route exact path = {path} component = {App}/>
        </React.Fragment>
    )
}

export default ReactRouter