import { combineReducers } from 'redux'
import UserReducer from './UserReducer'
import StudyReducer from './StudyReducer'
import ExperimentReducer from './ExperimentReducer'

export default combineReducers({
  user: UserReducer,
  study: StudyReducer,
  experiment: ExperimentReducer
})
