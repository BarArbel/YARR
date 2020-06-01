import { SHOW_SNACKBAR, RESET_SNACKBAR } from '../ActionsTypes/SnackbarActionTypes'

const showSnackbar = data => ({ type: SHOW_SNACKBAR, data: data })
const resetSnackbar = () => ({ type: RESET_SNACKBAR })

const handleShowSnackbar = data => async dispatch => {
  dispatch(showSnackbar(data))
}

const handleResetSnackbar = () => async dispatch => {
  dispatch(resetSnackbar())
}

export default {
  handleShowSnackbar,
  handleResetSnackbar
}