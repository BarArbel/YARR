import { TOGGLE_BUILD_STUDY } from '../ActionsTypes/StudyActionTypes'

const initialState = {
  buildStudy: false
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_BUILD_STUDY: {
      return {
        ...state,
        buildStudy: !state.buildStudy
      }
    }

    default:
      return state
  }
}