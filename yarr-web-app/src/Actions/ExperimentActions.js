import {
  SET_EXPERIMENTS,
  ADD_EXPERIMENT,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  TOGGLE_BUILD_EXPERIMENT,
  SELECT_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const setExperiments = experiments => ({ type: SET_EXPERIMENTS, data: experiments })

const addExperiment = (experimentId, studyId, title, creationDate, status, details, characterType, colorSettings, roundsNumber, roundsSettings) => ({
  type: ADD_EXPERIMENT,
  data: { experimentId, studyId, title, creationDate, status, details, characterType, colorSettings, roundsNumber, roundsSettings }
})

const updateExperiment = (experimentId, title, details, characterType, colorSettings) => ({
  type: UPDATE_EXPERIMENT,
  data: { experimentId, title, details, characterType, colorSettings }
})

const deleteExperiment = experimentId => ({
  type: DELETE_EXPERIMENT,
  data: experimentId
})

const toggleBuildExperiment = () => ({ type: TOGGLE_BUILD_EXPERIMENT })

const selectExperiment = experiment => ({
  type: SELECT_EXPERIMENT,
  data: experiment
})

const changeExperimentStatus = (experimentId, status) => ({
  type: CHANGE_EXPERIMENT_STATUS,
  data: { experimentId, status }
})

const handleSetExperiments = experiments => async dispatch => {
  dispatch(setExperiments(experiments))
}

const handleAddExperiment = (experimentId, studyId, title, creationDate, status, details, characterType, colorSettings, roundsNumber, roundsSettings ) => async dispatch => {
  dispatch(addExperiment(experimentId, studyId, title, creationDate, status, details, characterType, colorSettings, roundsNumber, roundsSettings))
}

const handleUpdateExperiment = (experimentId, title, details, characterType, colorSettings) => async dispatch => {
  dispatch(updateExperiment(experimentId, title, details, characterType, colorSettings));
}

const handleDeleteExperiment = experimentId => async dispatch => {
  dispatch(deleteExperiment(experimentId));
}

const handleToggleBuildExperiment = () => async dispatch => {
  dispatch(toggleBuildExperiment())
}

const handleSelectExperiment = experiment => async dispatch => {
  dispatch(selectExperiment(experiment))
}

const handleChangeExperimentStatus = (experimentId, status) => async dispatch => {
  dispatch(changeExperimentStatus(experimentId, status))
}

export default {
  handleSetExperiments,
  handleAddExperiment,
  handleUpdateExperiment,
  handleDeleteExperiment,
  handleToggleBuildExperiment,
  handleSelectExperiment,
  handleChangeExperimentStatus,
  setExperiments,
  addExperiment,
  updateExperiment,
  deleteExperiment,
  toggleBuildExperiment,
  selectExperiment,
  changeExperimentStatus
}
