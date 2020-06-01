import {
  SHOW_SNACKBAR,
  RESET_SNACKBAR
} from '../ActionsTypes/SnackbarActionTypes'

const initialState = {
  msg: "temp",
  open: false,
  severity: "success"
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SHOW_SNACKBAR: {
      return {
        ...state,
        open: true,
        msg: action.data.msg,
        severity: action.data.severity
      }
    }

    case RESET_SNACKBAR:
      return {
        ...state,
        open: false
      }

    default:
      return state
  }
}