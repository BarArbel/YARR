import { combineReducers } from 'redux'
import UserReducer from './UserReducer'
import ExperimentReducer from './ExperimentReducer'

export default combineReducers({
  user: UserReducer,
  experiment: ExperimentReducer
})
