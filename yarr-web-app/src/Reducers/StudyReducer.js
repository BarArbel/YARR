import { TOGGLE_BUILD_STUDY, ADD_STUDIES, DELETE_STUDY } from '../ActionsTypes/StudyActionTypes'

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

    case DELETE_STUDY: {
      const newList = state.studies.filter(i => parseInt(i.StudyId) !== action.data)
      return {
        ...state,
        studies: newList
      }
    }

    default:
      return state
  }
}