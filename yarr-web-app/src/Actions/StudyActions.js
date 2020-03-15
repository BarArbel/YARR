import { TOGGLE_BUILD_STUDY } from '../ActionsTypes/StudyActionTypes'

const toggleBuildStudy = () => ({ type: TOGGLE_BUILD_STUDY })

const handleToggleBuildStudy = () => async dispatch => {
  dispatch(toggleBuildStudy())
}

export default {
  handleToggleBuildStudy
}