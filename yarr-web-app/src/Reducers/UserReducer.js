import { 
  USER_LOGIN, 
  USER_LOGOUT, 
  SET_BEARER_KEY, 
  REMOVE_BEARER_KEY,
  TOGGLE_VERIFY_FINISH 
} from '../ActionsTypes/UserActionTypes'

const initialState = {
  verifyFinished: true,
  userInfo: localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : undefined,
  isLogged: localStorage.getItem("isLogged") ? JSON.parse(localStorage.getItem("isLogged")) : false,
  bearerKey: localStorage.getItem("bearerKey") ? localStorage.getItem("bearerKey") : undefined
}

export default (state = initialState, action) => {
    switch (action.type) {
      case USER_LOGIN: {
        return {
          ...state,
          isLogged: true,
          userInfo: action.data
        }
      }

      case USER_LOGOUT: {
        return {
          ...state,
          userInfo: undefined,
          isLogged: false,
          bearerKey: undefined
        }
      }

      case SET_BEARER_KEY: {
        return {
          ...state,
          bearerKey: action.data
        }
      }

      case REMOVE_BEARER_KEY: {
        return {
          ...state,
          bearerKey: undefined
        }
      }

      case TOGGLE_VERIFY_FINISH: {
        return {
          ...state,
          verifyFinished: action.data
        }
      }

      default:
        return state
    }
  }