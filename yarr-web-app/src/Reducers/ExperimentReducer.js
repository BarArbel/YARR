import {
  ADD_EXPERIEMNT,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const initialState = {}

export default (state = initialState, action) => {
  switch(action.type) {
    case ADD_EXPERIEMNT: {
      return state
    }
    case UPDATE_EXPERIMENT: {
      return state
    }
    case DELETE_EXPERIMENT: {
      return state
    }
    case CHANGE_EXPERIMENT_STATUS: {
      return state
    }
    default: {
      return state
    }
  }
}
