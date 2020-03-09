import TEST_ACTION1 from '../ActionsTypes/testActions'

const setPosts = posts => ({type: TEST_ACTION1, data: posts})

const handleSetPosts = posts => async dispatch => {
  dispatch(setPosts(posts))
}

export default {
    handleSetPosts
}