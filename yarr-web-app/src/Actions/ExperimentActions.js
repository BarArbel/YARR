import {
  SET_EXPERIMENTS,
  ADD_EXPERIMENT,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const setExperiments = experiments => ({ type: SET_EXPERIMENTS, data: experiments })

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

const handleSetExperiments = experiments => async dispatch => {
  dispatch(setExperiments(experiments))
}

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
  handleSetExperiments,
  handleUpdateExperiment,
  handleDeleteExperiment,
  handleChangeExperimentStatus,
  addExperiment,
  updateExperiment,
  deleteExperiment,
  changeExperimentStatus
}
