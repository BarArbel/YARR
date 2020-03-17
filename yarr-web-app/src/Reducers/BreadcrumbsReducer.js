import { SET_ROUTES } from '../ActionsTypes/BreadcrumbsActionTypes'

const initialState = {
  routes: [ 
    { name: 'Home', redirect: '/homePage', isActive: false },
  ]
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ROUTES: {
      return {
        ...state,
        routes: action.data
      }
    }

    default:
      return state
  }
}