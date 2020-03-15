import { TOGGLE_BUILD_STUDY, ADD_STUDIES } from '../ActionsTypes/StudyActionTypes'

const initialState = {
  buildStudy: false,
  studies: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_BUILD_STUDY: {
      return {
        ...state,
        buildStudy: !state.buildStudy
      }
    }

    case ADD_STUDIES: {
      return {
        ...state,
        studies: action.data
      }
    }

    default:
      return state
  }
}