import Header from '../Header'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import Breadcrumbs from '../Breadcrumbs'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserActions from '../../Actions/UserActions'
import StudyActions from '../../Actions/StudyActions'
import ExperimentList from '../Experiment/ExperimentList'
import ExperimentActions from '../../Actions/ExperimentActions'
import ExperimentBuilder from '../Experiment/ExperimentBuilder'
import BreadcrumbsActions from '../../Actions/BreadcrumbsActions'

const mapStateToProps = ({ user, study, experiment }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    studies: study.studies,
    buildExperiment: experiment.buildExperiment
  }
}

class StudyPage extends Component {
  constructor(props) {
    super(props)

    this.handleCreate = this.handleCreate.bind(this)
    this.renderLogged = this.renderLogged.bind(this)
    this.renderStudyInfo = this.renderStudyInfo.bind(this)
  }

  async componentDidMount() {
    const { handleSetExperiments, handleSetRoutes, buildExperiment, handleToggleBuildExperiment } = this.props
    const index = this.props.match.params.studyId
    const routes = [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/study/${index}`, isActive: false }
    ]
    const url = `http://localhost:3003/getAllStudyExperiments?studyId=${index}`

    buildExperiment && handleToggleBuildExperiment()
    handleSetRoutes(routes)
    await fetch(url).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        handleSetExperiments(json.experiments)
      }
      else {
        handleSetExperiments([])
      }
    })
    .catch(err => handleSetExperiments([]));
  }

  handleCreate() {
    const { handleToggleBuildExperiment, buildExperiment, handleSetRoutes } = this.props
    const index = this.props.match.params.studyId
    let tempBuild = !buildExperiment

    const routes = tempBuild ? 
    [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/study/${index}`, isActive: true },
      { name: 'Create Experiment', redirect: `/study/${index}`, isActive: false }
    ] 
    :
    [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/study/${index}`, isActive: false }
    ]

    handleSetRoutes(routes)
    handleToggleBuildExperiment()
  }

  renderStudyInfo() {

  }

  renderLogged() {
    const { userInfo, buildExperiment } = this.props
    const studyId = parseInt(this.props.match.params.studyId);
    const toggleButtonText = buildExperiment ? "Return" : "Create Experiment"
    const buttonColor = buildExperiment ? "blue-grey" : "light-green"

    return (
      <div className="studyPage">
        <Header />
        <Breadcrumbs/>
        <div className="container">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="profile-tab" data-toggle="tab" href="#experiments" role="tab" aria-controls="experiments" aria-selected="false">Experiments</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#insights" role="tab" aria-controls="insights" aria-selected="false">Insights</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#review" role="tab" aria-controls="review" aria-selected="false">Review & Export</a>
            </li>

          </ul>
          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">test1</div>
            <div className="tab-pane fade" id="experiments" role="tabpanel" aria-labelledby="profile-tab">
              <label/>
              <MDBBtn color={buttonColor} onClick={this.handleCreate} className="login-btn addStudy">{toggleButtonText}</MDBBtn>
              {buildExperiment ? (<ExperimentBuilder studyId={studyId} />) : (<ExperimentList studyId={studyId} />)}
            </div>
            <div className="tab-pane fade" id="insights" role="tabpanel" aria-labelledby="contact-tab">Placeholder 3</div>
            <div className="tab-pane fade" id="review" role="tabpanel" aria-labelledby="contact-tab">Placeholder 4</div>
          </div>
        </div>
      </div>
    )
  } 
  
  render() {
    const { isLogged } = this.props

    return isLogged ? (this.renderLogged()) : <Redirect to="/" />
  }
}

export default connect(mapStateToProps, { ...UserActions, ...StudyActions, ...ExperimentActions, ...BreadcrumbsActions })(StudyPage)
