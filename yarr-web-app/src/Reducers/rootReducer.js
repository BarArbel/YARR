import { combineReducers } from 'redux'
import UserReducer from './UserReducer'
import StudyReducer from './StudyReducer'
import ExperimentReducer from './ExperimentReducer'
import BreadcrumbsReducer from './BreadcrumbsReducer'

export default combineReducers({
  user: UserReducer,
  study: StudyReducer,
  experiment: ExperimentReducer,
  breadcrumbs: BreadcrumbsReducer
})
