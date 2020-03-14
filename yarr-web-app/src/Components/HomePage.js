import Header from './Header'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import StudyList from './Study/StudyList'
import { Redirect } from 'react-router-dom'
import UserActions from '../Actions/UserActions'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey
  }
}

class HomePage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mountFinish: false
    }

    this.handleLogout = this.handleLogout.bind(this)
  }

  async componentDidMount() {
    const { isLogged, handleSetUser, handleSetBearerKey } = this.props
    /* If not in state, check if in local storage */
    if (!isLogged) {
      /* If in local storage, add it to state */
      if (localStorage.getItem("isLogged") != null) {
        const isLogged = JSON.parse(localStorage.getItem("isLogged"))
        if (isLogged) {
          const userInfo = JSON.parse(localStorage.getItem("userInfo"))
          const bearerKey = localStorage.getItem("bearerKey")
          handleSetUser(userInfo)
          handleSetBearerKey(bearerKey)
        }
      }
    }

    this.setState({ mountFinish: true })
  }

  handleLogout() {
    const { handleRemoveUser, handleRemoveBearerKey } = this.props
    handleRemoveUser()
    handleRemoveBearerKey()
  }

  render() {
    const { isLogged, userInfo } = this.props
    const { mountFinish } = this.state

    return mountFinish ? (isLogged ? (
      <div className="homePage">
        <Header/>
        <div className="container">
          <label>{`Hello ${userInfo.firstName} ${userInfo.lastName}`}</label>
          <StudyList/>
        </div>
      </div>
    ) : (<Redirect to='/'/>)) : (null)
  }
}

export default connect(mapStateToProps, { ...UserActions })(HomePage);
