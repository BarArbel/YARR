import Header from '../Header'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import Breadcrumbs from '../Breadcrumbs'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserActions from '../../Actions/UserActions'
import StudyActions from '../../Actions/StudyActions'
import ExperimentList from '../Experiment/ExperimentList'
import StudyInsightRadar from '../Insights/StudyInsightsRadar'
import ExperimentActions from '../../Actions/ExperimentActions'
import ExperimentBuilder from '../Experiment/ExperimentBuilder'
import BreadcrumbsActions from '../../Actions/BreadcrumbsActions'
import StudyInsightsMirror from '../Insights/StudyInsightsMirror'

const mapStateToProps = ({ user, study, experiment }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    studies: study.studies,
    buildExperiment: experiment.buildExperiment,
    experimentList: experiment.experimentList
  }
}

class StudyPage extends Component {
  constructor(props) {
    super(props)

    this.numberOfEdits = 0
    this.state = {
      editExperiment: false
    }

    this.handleCreate = this.handleCreate.bind(this)
    this.renderLogged = this.renderLogged.bind(this)
    this.renderStudyInfo = this.renderStudyInfo.bind(this)
    this.handleToggleEdit = this.handleToggleEdit.bind(this)
  }

  async componentDidMount() {
    const { 
      studies,
      userInfo,
      handleSetRoutes, 
      buildExperiment, 
      handleAddStudies,
      handleSetExperiments, 
      handleToggleBuildExperiment
    } = this.props
    const studyId = this.props.match.params.studyId
    const routes = [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/study/${studyId}`, isActive: false }
    ]
    const studiesUrl = `https://yarr-study-service.herokuapp.com/getAllResearcherStudies?researcherId=${userInfo.researcherId}`
    const experimentsUrl = ` https://yarr-experiment-service.herokuapp.com/getAllStudyExperiments?studyId=${studyId}`

    buildExperiment && handleToggleBuildExperiment()
    handleSetRoutes(routes)
    fetch(experimentsUrl).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        handleSetExperiments(json.experiments)
      }
      else {
        handleSetExperiments([])
      }
    })
    .catch(err => handleSetExperiments([]))

    !studies.length && fetch(studiesUrl).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          handleAddStudies(json.studies)
        }
        else {
          handleAddStudies([])
        }
      })
      .catch(err => handleAddStudies([]))
  }

  handleToggleEdit(editExperiment) {
    editExperiment ? (this.numberOfEdits += 1) : (this.numberOfEdits -= 1)

    this.numberOfEdits > 0 ? this.setState({ editExperiment: true }) : this.setState({ editExperiment: false })
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
    const { studies } = this.props
    const studyId = this.props.match.params.studyId
    const idCompare = i => parseInt(i.StudyId) === parseInt(studyId)
    const currStudy = studies.find(idCompare)
    
    return currStudy ? (
      <div style={{marginTop: "25px"}}>
        <h2>{currStudy.Title}</h2>
        <p><b>Study Questions:</b> <br/>{currStudy.StudyQuestions}</p>
        <p><b>Description:</b> <br/> {currStudy.Description}</p>
      </div>
    ) : (null)
  }

  renderLogged() {
    const { buildExperiment, experimentList } = this.props
    const { editExperiment } = this.state
    const studyId = parseInt(this.props.match.params.studyId)
    const toggleButtonText = buildExperiment ? "Return" : experimentList.length ? "Create Experiment" : "Create First Experiment"
    const buttonClassName = experimentList.length || buildExperiment ? "login-btn addStudy" : "login-btn addFirstStudy"
    const buttonColor = buildExperiment ? "blue-grey" : "light-green"

    return (
      <div className="studyPage">
        <Header />
        <Breadcrumbs/>
        <div className="container">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="info-tab" data-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected="true">Info</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="experiments-tab" data-toggle="tab" href="#experiments" role="tab" aria-controls="experiments" aria-selected="false">Experiments</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="insights-tab" data-toggle="tab" href="#insights" role="tab" aria-controls="insights" aria-selected="false">Insights</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="review-tab" data-toggle="tab" href="#review" role="tab" aria-controls="review" aria-selected="false">Review & Export</a>
            </li>

          </ul>
          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="info" role="tabpanel" aria-labelledby="info-tab">
              {this.renderStudyInfo()}
            </div>
            <div className="tab-pane fade" id="experiments" role="tabpanel" aria-labelledby="profile-tab">
              <label/>
              {(experimentList.length || buildExperiment) && !editExperiment ? <MDBBtn color={buttonColor} onClick={this.handleCreate} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
              {buildExperiment ? (<ExperimentBuilder studyId={studyId} editForm={false} />) : (<ExperimentList studyId={studyId} toggleEdit={this.handleToggleEdit}/>)}
              {!experimentList.length && !buildExperiment ? <MDBBtn color={buttonColor} onClick={this.handleCreate} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
            </div>
            <div className="tab-pane fade" id="insights" role="tabpanel" aria-labelledby="contact-tab">
              <div className="insightHolder">
                <StudyInsightsMirror studyId={studyId} />
                <StudyInsightRadar studyId={studyId} />
                <StudyInsightsMirror studyId={studyId} />
                <StudyInsightRadar studyId={studyId} />
              </div>
            </div>
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
