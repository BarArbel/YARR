import {
  SET_EXPERIMENTS,
  ADD_EXPERIMENT,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  TOGGLE_BUILD_EXPERIMENT,
  SELECT_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const initialState = {
  experimentList: [],
  experiment: null,
  buildExperiment: false
}

export default (state = initialState, action) => {
  switch(action.type) {
    case SET_EXPERIMENTS: {
      return {
        ...state,
        experimentList: action.data
      }
    }

    case ADD_EXPERIMENT: {
      return {
        ...state,
        experimentList: [...state.experimentList, action.data]
      }
    }
    
    case UPDATE_EXPERIMENT: {
      const newList = state.experimentList.filter(i => parseInt(i.ExperimentId) !== action.data.experimentId)
      let toUpdate = state.experimentList.find(i => parseInt(i.ExperimentId) === action.data.experimentId)
      toUpdate.Title = action.data.title
      toUpdate.Details = action.data.details
      toUpdate.CharacterType = action.data.characterType
      toUpdate.ColorSettings = action.data.colorSettings
      return {
        ...state,
        experimentList: [...newList, toUpdate]
      }
    }

    case DELETE_EXPERIMENT: {
      const newList = state.experimentList.filter(i => parseInt(i.ExperimentId) !== action.data)
      return {
        ...state,
        experimentList: newList
      }
    }

    case TOGGLE_BUILD_EXPERIMENT: {
      return {
        ...state,
        buildExperiment: !state.buildExperiment
      }
    }

    case CHANGE_EXPERIMENT_STATUS: {
      const newList = state.experimentList.filter(i => parseInt(i.ExperimentId) !== action.data.experimentId)
      let toUpdate = state.experimentList.find(i => parseInt(i.ExperimentId) === action.data.experimentId)
      toUpdate.Status = action.data.status
      return {
        ...state,
        experimentList: [...newList, toUpdate]
      }
    }

    case SELECT_EXPERIMENT: {
      return {
        ...state,
        experiment: action.data
      }
    }

    default: {
      return state
    }
  }
}
