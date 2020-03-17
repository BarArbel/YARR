import {
  ADD_EXPERIMENT,
  SET_EXPERIMENTS,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  TOGGLE_BUILD_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const initialState = {
  experimentList: [],
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
      const newList = state.experimentList.filter(i => i.ExperimentId !== action.data.experimentId)
      let toUpdate = state.experimentList.filter(i => i.ExperimentId === action.data.experimentId)
      toUpdate.title = action.data.title
      toUpdate.details = action.data.details
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

    case CHANGE_EXPERIMENT_STATUS: {
      const newList = state.experimentList.filter(i => i.ExperimentId !== action.data.experimentId)
      let toUpdate = state.experimentList.filter(i => i.ExperimentId === action.data.experimentId)
      toUpdate.status = action.data.status
      return {
        ...state,
        experimentList: [...newList, toUpdate]
      }
    }

    case TOGGLE_BUILD_EXPERIMENT: {
      return {
        ...state,
        buildExperiment: !state.buildExperiment
      }
    }

    default: {
      return state
    }
  }
}
