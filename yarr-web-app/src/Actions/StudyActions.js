import { TOGGLE_BUILD_STUDY, ADD_STUDIES, DELETE_STUDY } from '../ActionsTypes/StudyActionTypes'

const toggleBuildStudy = () => ({ type: TOGGLE_BUILD_STUDY })
const addStudies = studies => ({ type: ADD_STUDIES, data: studies })
const deleteStudy = studyId => ({ type: DELETE_STUDY, data: studyId })

const handleToggleBuildStudy = () => async dispatch => {
  dispatch(toggleBuildStudy())
}

const handleAddStudies = studies => async dispatch => {
  dispatch(addStudies(studies))
}

const handleDeleteStudy = studyId => async dispatch => {
  dispatch(deleteStudy(studyId))
}
export default {
  handleToggleBuildStudy,
  handleAddStudies,
  handleDeleteStudy
}