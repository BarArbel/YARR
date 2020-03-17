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
  }

  async componentDidMount() {
    const { handleSetExperiments, handleSetRoutes, buildExperiment, handleToggleBuildExperiment } = this.props
    const index = this.props.match.params.studyId
    const routes = [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/Study/${index}`, isActive: false }
    ]
    const url = `http://localhost:3003/getAllStudyExperiments?studyId=${index}`

    buildExperiment && handleToggleBuildExperiment()
    handleSetRoutes(routes)
    await fetch(url).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        console.log(json)
        handleSetExperiments(json.experiments)
      }
      else {
        /* add error handeling */
        console.log(json)
      }
    })
    .catch(err => console.log(err));
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

  renderLogged(){
    const { userInfo, buildExperiment } = this.props
    const studyId = parseInt(this.props.match.params.studyId);
    const toggleButtonText = buildExperiment ? "Return" : "Create Experiment"
    const buttonColor = buildExperiment ? "blue-grey" : "light-green"

    return (
      <div className="studyPage">
        <Header />
        <Breadcrumbs/>
        <div className="container">
          <label/>
          <MDBBtn color={buttonColor} onClick={this.handleCreate} className="login-btn addStudy">{toggleButtonText}</MDBBtn>
          {buildExperiment ? (<ExperimentBuilder studyId={studyId}/>) : (<ExperimentList studyId={studyId} />)}
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
