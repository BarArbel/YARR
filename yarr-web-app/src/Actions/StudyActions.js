import { 
  ADD_STUDIES, 
  DELETE_STUDY, 
  UPDATE_STUDY,
  TOGGLE_BUILD_STUDY
} from '../ActionsTypes/StudyActionTypes'

const addStudies = studies => ({ type: ADD_STUDIES, data: studies })
const deleteStudy = studyId => ({ type: DELETE_STUDY, data: studyId })
const updateStudy = updatedStudy => ({ type: UPDATE_STUDY, data: updatedStudy })
const toggleBuildStudy = () => ({ type: TOGGLE_BUILD_STUDY })

const handleToggleBuildStudy = () => async dispatch => {
  dispatch(toggleBuildStudy())
}

const handleAddStudies = studies => async dispatch => {
  dispatch(addStudies(studies))
}

const handleDeleteStudy = studyId => async dispatch => {
  dispatch(deleteStudy(studyId))
}

const handleUpdateStudy = updatedStudy => async dispatch => {
  dispatch(updateStudy(updatedStudy))
}

export default {
  handleAddStudies,
  handleDeleteStudy,
  handleUpdateStudy,
  handleToggleBuildStudy
}