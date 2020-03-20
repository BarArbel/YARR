import { 
  ADD_STUDIES, 
  DELETE_STUDY, 
  UPDATE_STUDY,
  TOGGLE_BUILD_STUDY
} from '../ActionsTypes/StudyActionTypes'

const initialState = {
  studies: [],
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

    case ADD_STUDIES: {
      action.data.sort((a, b) => parseInt(b.StudyId) - parseInt(a.StudyId))
      return {
        ...state,
        studies: action.data
      }
    }

    case DELETE_STUDY: {
      const newList = state.studies.filter(i => parseInt(i.StudyId) !== action.data)
      newList.sort((a, b) => parseInt(b.StudyId) - parseInt(a.StudyId))
      return {
        ...state,
        studies: newList
      }
    }

    case UPDATE_STUDY: {
      let newList = state.studies.filter(i => parseInt(i.StudyId) !== parseInt(action.data.StudyId))
      newList.push(action.data)
      newList.sort((a, b) => parseInt(b.StudyId) - parseInt(a.StudyId))
      return {
        ...state,
        studies: newList
      }
    }

    default:
      return state
  }
}