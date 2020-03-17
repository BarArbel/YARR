import { USER_LOGIN, USER_LOGOUT, SET_BEARER_KEY, REMOVE_BEARER_KEY } from '../ActionsTypes/UserActionTypes'

const initialState = {
  userInfo: localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : undefined,
  isLogged: localStorage.getItem("isLogged") ? JSON.parse(localStorage.getItem("isLogged")) : false,
  bearerKey: localStorage.getItem("bearerKey") ? localStorage.getItem("bearerKey") : undefined
}


/* Saving/Removing userInfo to/from local storage needs to be added */

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

      default:
        return state
    }
  }