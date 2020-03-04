import React from 'react'
import ReactDOM from 'react-dom'
import ReactRouter from './Router/Router'
import * as serviceWorker from './serviceWorker'
import { createStore } from 'redux'
import rootReducer from './Reducers/rootReducer'
import './index.css'

const store = createStore(rootReducer)

ReactDOM.render(<ReactRouter store={store}/>, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
