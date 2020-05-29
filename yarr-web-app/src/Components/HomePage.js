import Header from './Header'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import Breadcrumbs from './Utilities/Breadcrumbs'
import React, { Component } from 'react'
import StudyList from './Study/StudyList'
import { Redirect } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import StudyBuilder from './Study/StudyBuilder'
import UserActions from '../Actions/UserActions'
import StudyActions from '../Actions/StudyActions'
import BreadcrumbsActions from '../Actions/BreadcrumbsActions'

const mapStateToProps = ({ user, study }) => {
  return {
    studies: study.studies,
    studyLoaded: study.studyLoaded,
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

    this.renderWait = this.renderWait.bind(this)
    this.renderLoaded = this.renderLoaded.bind(this)
    this.renderLogged = this.renderLogged.bind(this)
    this.getAllStudies = this.getAllStudies.bind(this)
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

  getAllStudies() {
    const { userInfo, bearerKey, handleAddStudies } = this.props
    const getAllUrl = `https://yarr-study-service.herokuapp.com/getAllResearcherStudies?researcherId=${userInfo.researcherId}`
    const json = {
      bearerKey: bearerKey,
      userInfo: userInfo
    }

    fetch(getAllUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    })
    .then(res => { 
      res.status === 200 && res.json().then(json => {
      if (json.result === "Success") {
        handleAddStudies(json.studies)
      }
      else {
        handleAddStudies([])
      }
      }) 
    })
    .catch(err => {
      console.log(err)
      handleAddStudies([])
    })
  }

  handleToggleBuild() {
    const { handleToggleBuildStudy } = this.props
    handleToggleBuildStudy()
  }

  handleToggleEdit(editStudy) {
    editStudy ? (this.numberOfEdits += 1) : (this.numberOfEdits -= 1)

    this.numberOfEdits > 0 ? this.setState({ editStudy: true }) : this.setState({ editStudy: false })
  }

  renderLoaded() {
    const { buildStudy, studies } = this.props
    const { editStudy } = this.state
    const toggleButtonText = buildStudy ? "Return" : studies.length ? "Create Study" : "Create First Study"
    const buttonClassName = studies.length || buildStudy ? "login-btn addStudy" : "login-btn addFirstStudy"
    const buttonColor = buildStudy ? "blue-grey" : "light-green"

    return (
      <div>
        {/* the emply label fixes some placement problems for some weird reason */}
        <label />
        {(studies.length || buildStudy) && !editStudy ? <MDBBtn color={buttonColor} onClick={this.handleToggleBuild} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
        {buildStudy ? <StudyBuilder /> : <StudyList toggleEdit={this.handleToggleEdit} />}
        {/* study list is empty */}
        {!studies.length && !buildStudy ? <MDBBtn color={buttonColor} onClick={this.handleToggleBuild} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
      </div>
    )
  }

  renderWait() {
    const renderSkeletons = [0, 1, 2]

    return (
      <div>
        <label />
        <MDBBtn color={"light-green"} onClick={this.handleToggleBuild} className={"login-btn addStudy"}>Create Study</MDBBtn>
        <div className="studyList">
          <h1 className="h4 text-center mb-4">My Studies</h1>
          {renderSkeletons.map(number => {
            return (
              <div key={`skeleton${number}`} className="card">
                <div className="card-body">
                  <Skeleton count={4} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  renderLogged(){
    const { studyLoaded } = this.props
    this.getAllStudies()
    return (
      <div className = "homePage">
        <Header />
        <Breadcrumbs />
        <div className="container">
          {studyLoaded ? this.renderLoaded() : this.renderWait()}
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
