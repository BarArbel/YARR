import {
  ADD_EXPERIEMNT,
  UPDATE_EXPERIMENT,
  DELETE_EXPERIMENT,
  CHANGE_EXPERIMENT_STATUS
} from "../ActionsTypes/ExperimentActionTypes"

const initialState = {
  experimentList: []
}

export default (state = initialState, action) => {
  switch(action.type) {
    case ADD_EXPERIEMNT: {
      return {
        experimentList: [...this.experimentList, action.data]
      }
    }
    case UPDATE_EXPERIMENT: {
      const newList = state.experimentList.filter(i => i.experimentId != action.data.experimentId)
      let toUpdate = state.experimentList.filter(i => i.experimentId == action.data.experimentId)
      toUpdate.title = action.data.title
      toUpdate.details = action.data.details
      return {
        experimentList: [...newList, toUpdate]
      }
    }
    case DELETE_EXPERIMENT: {
      const newList = state.experimentList.filter(i => i.experimentId != action.data.experimentId)
      return {
        experimentList: newList
      }
    }
    case CHANGE_EXPERIMENT_STATUS: {
      const newList = state.experimentList.filter(i => i.experimentId != action.data.experimentId)
      let toUpdate = state.experimentList.filter(i => i.experimentId == action.data.experimentId)
      toUpdate.status = action.data.status
      return {
        experimentList: [...newList, toUpdate]
      }
    }
    default: {
      return state
    }
  }
}
