import Header from '../Header'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserActions from '../../Actions/UserActions'
import ExperimentBuilder from './ExperimentBuilder'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey
  }
}

class ExperimentPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mountFinish: false
    }

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

  render() {
    const { isLogged } = this.props
    const { mountFinish } = this.state

    return mountFinish ? (isLogged ? (
      <div className="experimentPage">
        <Header />
        <div className="container">
        </div>
      </div>
    ) : (<Redirect to='/' />)) : (null)
  }
}

export default connect(mapStateToProps, { ...UserActions })(ExperimentPage);
