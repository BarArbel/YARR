import Header from './Header'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import Breadcrumbs from './Breadcrumbs'
import React, { Component } from 'react'
import StudyList from './Study/StudyList'
import { Redirect } from 'react-router-dom'
import StudyBuilder from './Study/StudyBuilder'
import UserActions from '../Actions/UserActions'
import StudyActions from '../Actions/StudyActions'
import BreadcrumbsActions from '../Actions/BreadcrumbsActions'

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

    this.renderLogged = this.renderLogged.bind(this)
    this.handleToggleBuild = this.handleToggleBuild.bind(this)
  }

  componentDidMount() {
    const { handleSetRoutes } = this.props
    const routes = [
      { name: 'Home', redirect: '/homePage', isActive: false },
    ]
    handleSetRoutes(routes)
  }

  handleToggleBuild() {
    const { handleToggleBuildStudy } = this.props
    handleToggleBuildStudy()
  }

  renderLogged(){
    const { userInfo, buildStudy } = this.props
    const toggleButtonText = buildStudy ? "Return" : "Create Study"
    const buttonColor = buildStudy ? "blue-grey" : "light-green"

      return (
        <div className = "homePage">
          <Header />
          <Breadcrumbs/ >
          <div className="container">
            <label/>
            <MDBBtn color={buttonColor} onClick={this.handleToggleBuild} className="login-btn addStudy">{toggleButtonText}</MDBBtn>
            {buildStudy ? <StudyBuilder/> : <StudyList/>}
          </div>
        </div>
      )
  }

  render() {
    const { isLogged } = this.props
    return isLogged ? (this.renderLogged()) : <Redirect to="/"/>
  }
}

export default connect(mapStateToProps, { ...UserActions, ...StudyActions, ...BreadcrumbsActions })(HomePage);
