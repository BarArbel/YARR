import Header from './Header'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import StudyList from './Study/StudyList'
import { Redirect } from 'react-router-dom'
import StudyBuilder from './Study/StudyBuilder'
import UserActions from '../Actions/UserActions'
import StudyActions from '../Actions/StudyActions'

const mapStateToProps = ({ user, study }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    buildStudy: study.buildStudy
  }
}

class HomePage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mountFinish: false
    }

    this.handleToggleBuild = this.handleToggleBuild.bind(this)
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

  handleToggleBuild() {
    const { handleToggleBuildStudy } = this.props
    handleToggleBuildStudy()
  }

  render() {
    const { isLogged, userInfo, buildStudy } = this.props
    const { mountFinish } = this.state
    const toggleButtonText = buildStudy ? "Return" : "Create Study"
    const buttonColor = buildStudy ? "blue-grey" : "light-green"
    return mountFinish ? (isLogged ? (
      <div className="homePage">
        <Header/>
        <div className="container">
          <label>{`Hello ${userInfo.firstName} ${userInfo.lastName}`}</label>
          <MDBBtn color={buttonColor} onClick={this.handleToggleBuild} className="login-btn addStudy">{toggleButtonText}</MDBBtn>
          {buildStudy ? <StudyBuilder /> : <StudyList />}
        </div>
      </div>
    ) : (<Redirect to='/'/>)) : (null)
  }
}

export default connect(mapStateToProps, { ...UserActions, ...StudyActions })(HomePage);
