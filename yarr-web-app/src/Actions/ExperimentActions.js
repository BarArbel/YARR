import {
  SET_EXPERIMENTS,
  RESET_EXPERIMENTS,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  SELECT_EXPERIMENT,
  TOGGLE_BUILD_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const setExperiments = experiments => ({ type: SET_EXPERIMENTS, data: experiments })

const resetExperiments = () => ({ type: RESET_EXPERIMENTS })

const updateExperiment = (experimentId, title, details, disability, characterType, colorSettings) => ({
  type: UPDATE_EXPERIMENT,
  data: { experimentId, title, details, disability, characterType, colorSettings }
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

const changeExperimentStatus = (experimentId, data) => ({
  type: CHANGE_EXPERIMENT_STATUS,
  data: { experimentId, data }
})

const handleSetExperiments = experiments => async dispatch => {
  dispatch(setExperiments(experiments))
}

const handleResetExperiments = () => async dispatch => {
  dispatch(resetExperiments())
}

const handleUpdateExperiment = (experimentId, title, details, disability, characterType, colorSettings) => async dispatch => {
  dispatch(updateExperiment(experimentId, title, details, disability, characterType, colorSettings));
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

const handleChangeExperimentStatus = (experimentId, data) => async dispatch => {
  dispatch(changeExperimentStatus(experimentId, data))
}

export default {
  handleSetExperiments,
  handleResetExperiments,
  handleUpdateExperiment,
  handleDeleteExperiment,
  handleToggleBuildExperiment,
  handleSelectExperiment,
  handleChangeExperimentStatus,
  setExperiments,
  updateExperiment,
  deleteExperiment,
  toggleBuildExperiment,
  selectExperiment,
  changeExperimentStatus
}
