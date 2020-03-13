import React from 'react'
import ReactDOM from 'react-dom'
import ReactRouter from './Router/Router'
import thunk from 'redux-thunk'
import * as serviceWorker from './serviceWorker'
import { applyMiddleware, createStore, compose } from 'redux'
import rootReducer from './Reducers/rootReducer'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import './index.css'

const middleware = applyMiddleware(thunk)
const composedEnhancers = compose(middleware)
const initialState = {}
const store = createStore(rootReducer, initialState, composedEnhancers)

ReactDOM.render(<ReactRouter store={store}/>, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
