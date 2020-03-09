import { TEST_ACTION1, SET_BEARER_KEY } from '../ActionsTypes/testActions'

const setPosts = posts => ({type: TEST_ACTION1, data: posts})
const setBearerKey = key => ({type: SET_BEARER_KEY, data: key})

const handleSetPosts = posts => async dispatch => {
  dispatch(setPosts(posts))
}

const handleSetBearerKey = key => async dispatch => {
  dispatch(setBearerKey(key))
}

export default {
    handleSetPosts,
    handleSetBearerKey
}