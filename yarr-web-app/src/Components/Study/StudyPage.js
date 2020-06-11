import Header from '../Header'
import { MDBBtn } from 'mdbreact'
import { CSVLink } from 'react-csv'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { withRouter } from "react-router"
import { Redirect } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import Breadcrumbs from '../Utilities/Breadcrumbs'
import MoonLoader from "react-spinners/MoonLoader"
import InsightsBars from '../Insights/InsightsBars'
import UserActions from '../../Actions/UserActions'
import StudyActions from '../../Actions/StudyActions'
import InsightMirror from '../Insights/InsightMirror'
import ExperimentList from '../Experiment/ExperimentList'
import StudyInsightRadar from '../Insights/StudyInsightsRadar'
import ExperimentActions from '../../Actions/ExperimentActions'
import ExperimentBuilder from '../Experiment/ExperimentBuilder'
import StudyInsightsMixed from '../Insights/StudyInsightsMixed'
import BreadcrumbsActions from '../../Actions/BreadcrumbsActions'

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
  _isMounted = false

  constructor(props) {
    super(props)

    this.numberOfEdits = 0
    this.state = {
      csvData : [],
      csvLoaded: false,
      studyLoaded: false,
      editExperiment: false
    }
    this.setRoutes = this.setRoutes.bind(this)
    this.renderWait = this.renderWait.bind(this)
    this.fetchRawData = this.fetchRawData.bind(this)
    this.fetchStudies = this.fetchStudies.bind(this)
    this.renderLoaded = this.renderLoaded.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.renderLogged = this.renderLogged.bind(this)
    this.renderStudyInfo = this.renderStudyInfo.bind(this)
    this.fetchExperiments = this.fetchExperiments.bind(this)
    this.handleToggleEdit = this.handleToggleEdit.bind(this)
    this.renderWaitForStudy = this.renderWaitForStudy.bind(this)
  }

  async componentDidMount() {
    this._isMounted = true
    const { 
      studies,
      isLogged,
      buildExperiment, 
      handleResetExperiments,
      handleToggleBuildExperiment
    } = this.props
    const studyId = this.props.match.params.studyId

    if(isLogged) {
      handleResetExperiments()
      this.setRoutes()
      buildExperiment && handleToggleBuildExperiment()
  
      if(studies && studies.length) {
        const studyExists = studies.find(line => line.StudyId === studyId)
        if (studyExists !== undefined) {
          this.fetchExperiments()
          this.fetchRawData()
        }
        this._isMounted && this.setState({ studyLoaded: true })
      } 
      !studies.length && await this.fetchStudies()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  setRoutes(){
    const { handleSetRoutes } = this.props
    const studyId = this.props.match.params.studyId
    const routes = [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/study/${studyId}`, isActive: false }
    ]
    handleSetRoutes(routes)
  }

  fetchExperiments(){
    const {
      userInfo,
      bearerKey,
      handleSetExperiments,
    } = this.props
    const studyId = this.props.match.params.studyId
    const experimentsUrl = ` https://yarr-experiment-service.herokuapp.com/getAllStudyExperiments?studyId=${studyId}`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    fetch(experimentsUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res =>{ 
      if(res.status === 200) {
        res.json().then(json => {
          if (json.result === "Success") {
            handleSetExperiments(json.experiments)
          }
          else {
            handleSetExperiments([])
          }
        })
      }
      else handleSetExperiments([])
    })
    .catch(err => {
      handleSetExperiments([])
    })
  }

  async fetchStudies(){
    const {
      userInfo,
      bearerKey,
      handleAddStudies,
    } = this.props
    const studyId = this.props.match.params.studyId
    const studiesUrl = `https://yarr-study-service.herokuapp.com/getAllResearcherStudies?researcherId=${userInfo.researcherId}`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    fetch(studiesUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => { 
      if(res.status === 200){
          res.json().then(json => {
          if (json.result === "Success") {
            const studyExists = json.studies.find(line => line.StudyId === studyId)
            handleAddStudies(json.studies)
            if(studyExists !== undefined) {
              this.fetchExperiments()
              this.fetchRawData()
              this._isMounted && this.setState({ studyLoaded: true })
            }
            else this.props.history.push('/')
          }
          else {
            handleAddStudies([])
            this.props.history.push('/')
          }
        }) 
      }
      else {
        handleAddStudies([])
        this.props.history.push('/')
      }
    })
    .catch(err => {
      handleAddStudies([])
      this.props.history.push('/')
    })
  }

  async fetchRawData() {
    const {
      userInfo,
      bearerKey
    } = this.props
    const studyId = this.props.match.params.studyId
    const rawDataURL = `https://yarr-insight-service.herokuapp.com/requestAllRawData?studyId=${studyId}`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    await fetch(rawDataURL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => { 
      if(res.status === 200){
        res.json().then(json => {
        if (json.result === "Success") {
          this._isMounted && this.setState({ csvData: json.data, csvLoaded: true })
        }
        else {
          this._isMounted && this.setState({ csvData: [], csvLoaded: true })
        }
        })
      }
      else this._isMounted && this.setState({ csvData: [], csvLoaded: true })
    })
    .catch(err => {
      this._isMounted && this.setState({ csvData: [], csvLoaded: true })
    })
  }

  handleToggleEdit(editExperiment) {
    editExperiment ? (this.numberOfEdits += 1) : (this.numberOfEdits -= 1)

    this.numberOfEdits > 0 ? this._isMounted && this.setState({ editExperiment: true }) : this._isMounted && this.setState({ editExperiment: false })
  }

  handleCreate() {
    const { handleToggleBuildExperiment } = this.props
    handleToggleBuildExperiment()
  }

  renderStudyInfo() {
    const { studies } = this.props
    const studyId = this.props.match.params.studyId
    const idCompare = i => parseInt(i.StudyId) === parseInt(studyId)
    const currStudy = studies.find(idCompare)

    return currStudy ? (
      <div style={{ marginTop: "25px" }}>
        <h2 style={{ fontWeight: 'bold' }}>{currStudy.Title}</h2>
        <p style={{marginTop: '10px'}}><b>Study Questions:</b> <br/>{currStudy.StudyQuestions}</p>
        {currStudy.Description.length !== 0 && <p style={{ marginTop: '10px' }}><b>Description:</b> <br/> {currStudy.Description}</p>}
      </div>
    ) : (null)
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
        <MDBBtn color={"light-green"} onClick={this.handleToggleBuild} className={"login-btn addStudy"}>Create Experiment</MDBBtn>
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
    const { studies, experimentsLoaded, userInfo } = this.props
    const { studyLoaded, csvData, csvLoaded } = this.state
    const studyId = parseInt(this.props.match.params.studyId)
    const idCompare = i => parseInt(i.StudyId) === parseInt(studyId)
    const currStudy = studies.find(idCompare)
    const barsURL = `https://yarr-insight-service.herokuapp.com/requestStudyInsightBars?researcherId=${userInfo.researcherId}&studyId=${studyId}`
    const mirrorURL = `https://yarr-insight-service.herokuapp.com/requestStudyInsightMirror?researcherId=${userInfo.researcherId}&studyId=${studyId}`

    const fileName = currStudy ? `Study ${currStudy.Title} Raw Data.csv` : "tempName.csv"

    return (
      <div className="studyPage">
        <Header />
        <Breadcrumbs/>
        <div className="container">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a className="nav-link" id="info-tab" data-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected="true">Info</a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" id="experiments-tab" data-toggle="tab" href="#experiments" role="tab" aria-controls="experiments" aria-selected="false">Experiments</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="insights-tab" data-toggle="tab" href="#insights" role="tab" aria-controls="insights" aria-selected="false">Insights</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="review-tab" data-toggle="tab" href="#review" role="tab" aria-controls="review" aria-selected="false">Review & Export</a>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade" id="info" role="tabpanel" aria-labelledby="info-tab">
              {studyLoaded ? this.renderStudyInfo() : this.renderWaitForStudy()}
            </div>
            <div className="tab-pane fade show active" id="experiments" role="tabpanel" aria-labelledby="profile-tab">
              {experimentsLoaded ? this.renderLoaded() : this.renderWait()}
            </div>
            <div className="tab-pane fade" id="insights" role="tabpanel" aria-labelledby="contact-tab">
              <div>
                { 
                currStudy ?
                <div>
                  <InsightMirror url={mirrorURL} />
                  <StudyInsightRadar studyId={studyId} />
                  <InsightsBars url={barsURL} />
                  <StudyInsightsMixed studyId={studyId} />
                </div>
                :
                null
                }
              </div>
            </div>
            <div className="tab-pane fade" id="review" role="tabpanel" aria-labelledby="contact-tab">
              <p>
                Download CSV file of all raw data collected in this study.
              </p>
              {
              csvLoaded && currStudy? 
                (
                  csvData.length ? <CSVLink className="login-btn btn btn-primary" filename={fileName} data={csvData}>Download</CSVLink> 
                  : 
                  <p style={{ textAlign: "center", paddingTop: "25px" }}>No data collected</p>
                ) 
              : 
                (
                  <div style={{marginTop: '30px'}} className="barLoader">
                    <MoonLoader size={100} color={"#123abc"} loading={true} />
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    )
  } 
  
  render() {
    const { isLogged } = this.props

    return isLogged ? (this.renderLogged()) : <Redirect to='/' />
  }
}

export default connect(mapStateToProps, { ...UserActions, ...StudyActions, ...ExperimentActions, ...BreadcrumbsActions })(withRouter(StudyPage))
