import { SET_ROUTES } from '../ActionsTypes/BreadcrumbsActionTypes'

const setRoutes = routes => ({ type: SET_ROUTES, data: routes })

const handleSetRoutes = routes => async dispatch => {
  dispatch(setRoutes(routes))
}

export default {
  handleSetRoutes
}