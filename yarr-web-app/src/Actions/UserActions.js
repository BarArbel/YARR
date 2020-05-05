import { USER_LOGIN, USER_LOGOUT, SET_BEARER_KEY, REMOVE_BEARER_KEY, TOGGLE_VERIFY_FINISH } from '../ActionsTypes/UserActionTypes'

const setUser = userInfo => ({ type: USER_LOGIN, data: userInfo })
const removeUser = () => ({ type: USER_LOGOUT })
const setBearerKey = bearerKey => ({ type: SET_BEARER_KEY, data: bearerKey })
const removeBearerKey = () => ({ type: REMOVE_BEARER_KEY })
const SetVerifyFinished = value => ({ type: TOGGLE_VERIFY_FINISH, data: value })

const handleSetUser = userInfo => async dispatch => {
  localStorage.setItem("userInfo", JSON.stringify(userInfo))
  localStorage.setItem("isLogged", true)
  dispatch(setUser(userInfo))
}

const handleRemoveUser = () => async dispatch => {
  localStorage.removeItem("userInfo")
  localStorage.removeItem("isLogged")
  dispatch(removeUser())
}

const handleSetBearerKey = bearerKey => async dispatch => {
  localStorage.setItem("bearerKey", bearerKey)
  dispatch(setBearerKey(bearerKey))
}

const handleRemoveBearerKey = () => async dispatch => {
  localStorage.removeItem("bearerKey")
  dispatch(removeBearerKey())
}

const handleSetVerifyFinished = value => async dispatch => {
  dispatch(SetVerifyFinished(value))
}

export default {
  handleSetUser,
  handleRemoveUser,
  handleSetBearerKey,
  handleRemoveBearerKey,
  handleSetVerifyFinished
}