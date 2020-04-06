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
    studies: study.studies,
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    buildStudy: study.buildStudy
  }
}

class HomePage extends Component {
  constructor(props) {
    super(props) 

    this.numberOfEdits = 0
    this.state = {
      editStudy: false
    }

    this.renderLogged = this.renderLogged.bind(this)
    this.handleToggleEdit = this.handleToggleEdit.bind(this)
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

  handleToggleEdit(editStudy) {
    editStudy ? (this.numberOfEdits += 1) : (this.numberOfEdits -= 1)

    this.numberOfEdits > 0 ? this.setState({ editStudy: true }) : this.setState({ editStudy: false })
  }

  renderLogged(){
    const { buildStudy, studies } = this.props
    const { editStudy } = this.state
    const toggleButtonText = buildStudy ? "Return" : studies.length ? "Create Study" : "Create First Study"
    const buttonClassName = studies.length || buildStudy ? "login-btn addStudy" : "login-btn addFirstStudy"
    const buttonColor = buildStudy ? "blue-grey" : "light-green"

      return (
        <div className = "homePage">
          <Header />
          <Breadcrumbs/ >
          <div className="container">
            <label/>
            {(studies.length || buildStudy) && !editStudy ? <MDBBtn color={buttonColor} onClick={this.handleToggleBuild} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
            {buildStudy ? <StudyBuilder/> : <StudyList toggleEdit={this.handleToggleEdit}/>}
            {!studies.length && !buildStudy ? <MDBBtn color={buttonColor} onClick={this.handleToggleBuild} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
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
