import TEST_ACTION1 from '../ActionsTypes/testActions'

const initialState = {
    posts: [
        {id: 1, text: "asdasdasd"}
    ]
}

export default (state = initialState, action) => {
    switch (action.type) {
      case TEST_ACTION1:
        return {
          ...state,
          posts: action.data
        }
      default:
        return state
    }
  }