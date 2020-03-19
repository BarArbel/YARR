import { 
  ADD_STUDY,
  ADD_STUDIES, 
  DELETE_STUDY, 
  UPDATE_STUDY,
  TOGGLE_BUILD_STUDY
} from '../ActionsTypes/StudyActionTypes'

const addStudy = study => ({ type: ADD_STUDY, data: study })
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

const handleAddStudy = study => async dispatch => {
  dispatch(addStudy(study))
}

const handleDeleteStudy = studyId => async dispatch => {
  dispatch(deleteStudy(studyId))
}

const handleUpdateStudy = updatedStudy => async dispatch => {
  dispatch(updateStudy(updatedStudy))
}

export default {
  handleAddStudy,
  handleAddStudies,
  handleDeleteStudy,
  handleUpdateStudy,
  handleToggleBuildStudy
}