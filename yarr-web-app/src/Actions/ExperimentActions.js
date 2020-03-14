import {
  ADD_EXPERIMENT,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const addExperiment = (experimentId, studyId, title, creationDate, status, details, gameSettings) => ({
  type: ADD_EXPERIMENT,
  data: { experimentId, studyId, title, creationDate, status, details, gameSettings }
})

const updateExperiment = (experimentId, title, details) => ({
  type: UPDATE_EXPERIMENT,
  data: { experimentId, title, details }
})

const deleteExperiment = experimentId => ({
  type: DELETE_EXPERIMENT,
  data: { experimentId }
})

const changeExperimentStatus = (experimentId, status) => ({
  type: CHANGE_EXPERIMENT_STATUS,
  data: { experimentId, status }
})

const handleAddExperiment = (experimentId, studyId, title, creationDate, status, details, gameSettings ) => async dispatch => {
  dispatch(addExperiment(experimentId, studyId, title, creationDate, status, details, gameSettings))
}

const handleUpdateExperiment = (experimentId, title, details) => async dispatch => {
  dispatch(updateExperiment(experimentId, title, details));
}

const handleDeleteExperiment = experimentId => async dispatch => {
  dispatch(deleteExperiment(experimentId));
}

const handleChangeExperimentStatus = (experimentId, status) => async dispatch => {
  dispatch(changeExperimentStatus(experimentId, status))
}

export default {
  handleAddExperiment,
  handleUpdateExperiment,
  handleDeleteExperiment,
  handleChangeExperimentStatus,
  addExperiment,
  updateExperiment,
  deleteExperiment,
  changeExperimentStatus
}
