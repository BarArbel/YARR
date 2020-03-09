import { TEST_ACTION1, SET_BEARER_KEY } from '../ActionsTypes/testActions'

const initialState = {
    posts: [
        {id: 1, text: "asdasdasd"}
    ],
    bearerKey: undefined
}

export default (state = initialState, action) => {
    switch (action.type) {
      case TEST_ACTION1:
        return {
          ...state,
          posts: action.data
        }
      case SET_BEARER_KEY:
        return {
          ...state,
          bearerKey: action.data
        }
      default:
        return state
    }
  }