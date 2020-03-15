import { TOGGLE_BUILD_STUDY, ADD_STUDIES } from '../ActionsTypes/StudyActionTypes'

const toggleBuildStudy = () => ({ type: TOGGLE_BUILD_STUDY })
const addStudies = studies => ({ type: ADD_STUDIES, data: studies })

const handleToggleBuildStudy = () => async dispatch => {
  dispatch(toggleBuildStudy())
}

const handleAddStudies = studies => async dispatch => {
  dispatch(addStudies(studies))
}

export default {
  handleToggleBuildStudy,
  handleAddStudies
}