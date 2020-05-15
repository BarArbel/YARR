import Header from '../Header'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import Breadcrumbs from '../Utilities/Breadcrumbs'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
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
    experimentList: experiment.experimentList,
    experimentsLoaded: experiment.experimentsLoaded
  }
}

class StudyPage extends Component {
  constructor(props) {
    super(props)

    this.numberOfEdits = 0
    this.state = {
      studyLoaded: false,
      editExperiment: false
    }
    this.renderWait = this.renderWait.bind(this)
    this.renderLoaded = this.renderLoaded.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.renderLogged = this.renderLogged.bind(this)
    this.renderStudyInfo = this.renderStudyInfo.bind(this)
    this.handleToggleEdit = this.handleToggleEdit.bind(this)
    this.renderWaitForStudy = this.renderWaitForStudy.bind(this)
  }

  async componentDidMount() {
    const { 
      studies,
      userInfo,
      bearerKey,
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
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    buildExperiment && handleToggleBuildExperiment()
    handleSetRoutes(routes)
    fetch(experimentsUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        handleSetExperiments(json.experiments)
      }
      else {
        handleSetExperiments([])
      }
    })
    .catch(err => handleSetExperiments([]))

    studies.length && this.setState({ studyLoaded: true })

    !studies.length && fetch(studiesUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          handleAddStudies(json.studies)
          this.setState({ studyLoaded: true })
        }
        else {
          /* redirect to HomePage */
          handleAddStudies([])
        }
      })
      .catch(err => {
        /* redirect to HomePage */
        handleAddStudies([])
      })
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
    ) : (null) /* redirect to HomePage */
  }

  renderWaitForStudy() {
    return (
      <div style={{ marginTop: "25px" }} >
        <Skeleton count={5} />
      </div>
    )
  }

  renderLoaded() {
    const { buildExperiment, experimentList } = this.props
    const { editExperiment } = this.state
    const toggleButtonText = buildExperiment ? "Return" : experimentList.length ? "Create Experiment" : "Create First Experiment"
    const buttonClassName = experimentList.length || buildExperiment ? "login-btn addStudy" : "login-btn addFirstStudy"
    const buttonColor = buildExperiment ? "blue-grey" : "light-green"
    const studyId = parseInt(this.props.match.params.studyId)

    return (
      <div>
        <label />
        {(experimentList.length || buildExperiment) && !editExperiment ? <MDBBtn color={buttonColor} onClick={this.handleCreate} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
        {buildExperiment ? (<ExperimentBuilder studyId={studyId} editForm={false} />) : (<ExperimentList studyId={studyId} toggleEdit={this.handleToggleEdit} />)}
        {!experimentList.length && !buildExperiment ? <MDBBtn color={buttonColor} onClick={this.handleCreate} className={buttonClassName}>{toggleButtonText}</MDBBtn> : null}
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
          <h1 className="h4 text-center mb-4">Study Experiments</h1>
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

  renderLogged() {
    const { studyLoaded } = this.state
    const { experimentsLoaded } = this.props
    const studyId = parseInt(this.props.match.params.studyId)

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
              {studyLoaded ? this.renderStudyInfo() : this.renderWaitForStudy()}
            </div>
            <div className="tab-pane fade" id="experiments" role="tabpanel" aria-labelledby="profile-tab">
              {experimentsLoaded ? this.renderLoaded() : this.renderWait()}
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
