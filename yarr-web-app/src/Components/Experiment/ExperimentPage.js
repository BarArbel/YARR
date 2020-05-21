import Header from '../Header'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { MDBBtn } from 'mdbreact'
import { Redirect } from 'react-router-dom'
import CoopImg from '../../cooperative.png'
import CompImg from '../../competitive.png'
import CodeView from '../Utilities/CodeView'
import Skeleton from 'react-loading-skeleton'
import DifficultyImg from '../../difficulty.png'
import Breadcrumbs from '../Utilities/Breadcrumbs'
import { confirmAlert } from 'react-confirm-alert'
import ClipLoader from "react-spinners/ClipLoader"
import UserActions from '../../Actions/UserActions'
import ExperimentActions from '../../Actions/ExperimentActions'
import BreadcrumbsActions from '../../Actions/BreadcrumbsActions'
import StudyInsightsMirror from '../Insights/StudyInsightsMirror'

const mapStateToProps = ({ user, experiment }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    experimentList: experiment.experimentList,
    experiment: experiment.experiment
  }
}

class ExperimentPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      experimentLoaded: false,
      startStopFinished: true
    }

    this.renderLogged = this.renderLogged.bind(this)
    this.renderRounds = this.renderRounds.bind(this)
    this.handleViewGameCode = this.handleViewGameCode.bind(this)
    this.handleStopExperiment = this.handleStopExperiment.bind(this)
    this.handleStartExperiment = this.handleStartExperiment.bind(this)
  }

  async componentDidMount() {
    const { 
      handleSetRoutes, 
      handleSelectExperiment,
      handleSetExperiments, 
      experimentList, 
      userInfo, 
      bearerKey 
    } = this.props
    const experimentId = this.props.match.params.experimentId
    const studyId = this.props.match.params.studyId
    const routes = [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/Study/${studyId}`, isActive: true },
      { name: 'Experiment', redirect: `/Study/${studyId}/Experiment/${experimentId}`, isActive: false }
    ]

    let experiment = null
    if(experimentList.length === 0) {
      const url = `https://yarr-experiment-service.herokuapp.com/getExperiment?experimentId=${experimentId}`
      const json = {
        userInfo: userInfo,
        bearerKey: bearerKey
      }
      
      await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json)
      }).then(res => res.json()).then(json => {
        if (json.result === "Success") {
          experiment = json.experiment
        }
      })
      .catch(err => console.log(err))

    } else {
      const idCompare = i => parseInt(i.ExperimentId) === parseInt(experimentId)
      experiment = experimentList.find(idCompare)
    }
    
    handleSetRoutes(routes)
    handleSelectExperiment(experiment)
    handleSetExperiments([experiment])
    this.setState({ experimentLoaded: true })
  }

  handleStartExperiment(){
    const { experiment, userInfo, bearerKey, handleChangeExperimentStatus } = this.props
    const url = `https://yarr-experiment-service.herokuapp.com/startExperiment`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey,
      experimentId: experiment.ExperimentId
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        handleChangeExperimentStatus(parseInt(experiment.ExperimentId), { status: "Running", gameCode: json.gameCode })
      }
    })
      .catch(err => console.log(err))
  }

  handleStopExperiment(){
    const { experiment, userInfo, bearerKey, handleChangeExperimentStatus } = this.props
    const url = `https://yarr-experiment-service.herokuapp.com/stopExperiment`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey,
      experimentId: experiment.ExperimentId
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        handleChangeExperimentStatus(parseInt(experiment.ExperimentId), { status: "Stopped", gameCode: "null "})
      }
    })
      .catch(err => console.log(err))
  }

  renderWaitForExperiment() {
    return (
      <div style={{ marginTop: "25px" }} >
        <Skeleton count={5} />
      </div>
    )
  }

  renderRounds() {
    const { Rounds } = this.props.experiment
    const gameMode = ["Cooperative", "Competitive"]
    const difficulty = ["Adaptive", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6"]

    return (
      <div>
        <ul>
          {Rounds.map((value, index) => {
            const { Difficulty } = value
            let difficultyColor = null
            if(Difficulty > 0) {
              if(Difficulty > 4) {
                difficultyColor = { fontWeight: "bold", color: "#B33A3A" }
              }
              else if (Difficulty > 2) {
                difficultyColor = { fontWeight: "bold", color: "#ffae42" }
              }
              else difficultyColor = { fontWeight: "bold", color: "#4BB543"}
            }
            else difficultyColor = { fontWeight: "bold" }
            return (
              <div className="card cardSmall" key={`round${index}`}>
                <p className="roundNumber">Round {parseInt(value.RoundNumber) + 1}</p>
                <div className="card-body">
                  <img src={value.GameMode > 1 ? CompImg : CoopImg} alt="Game Mode" className="modePic"/>
                  <p className="card-text" style={{ textAlign: 'center', paddingTop: '13px'}}>{gameMode[value.GameMode - 1]}</p>
                  <div className="difficultyHolder">
                    <img alt="Difficulty Level: " src={DifficultyImg} className="difficultyPic"/>
                    <p className="card-text difficultyText" style={difficultyColor}>{difficulty[value.Difficulty]}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </ul>
      </div>
    )
  }

  handleViewGameCode() {
    const { experiment } = this.props
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CodeView
            onClose={onClose}
            gameCode={experiment.GameCode}
          />
        )
      }
    })
  }

  renderLogged(){
    const { experiment } = this.props
    const { experimentLoaded, startStopFinished } = this.state
    const disability = ["No disability", "Tetraplegia\\Quadriplegia", "Color blindness"]
    const characterType = ["Characters differentiated by color", "Characters differentiated by shapes", "Characters differentiated by design"]
    const colorSettings = ["Full spectrum vision", "Red-green color blindness", "Blue-yellow color blindness"]
    let {
      CreationDate,
      Status,
      Title,
      Details,
      RoundsNumber,
      RoundDuration,
      Disability,
      CharacterType,
      ColorSettings,
    } = experiment
    const studyId = this.props.match.params.studyId
    const buttonText = Status === "Running" ? "STOP EXPERIMENT" : "START EXPERIMENT"
    const codeButtonColor = Status === "Running" ? "elegant" : "success"
    const endStartColor = Status === "Running" ? "yellowButton" : "greenButton"
    const codeButtonFunction = Status === "Running" ? this.handleStopExperiment : this.handleStartExperiment
    const runningStyle = ({ color: "#4BB543", fontWeight: "bold" })
    return (
      <div className="studyPage">
        <Header />
        <Breadcrumbs/>
        <div className="container">
          <div>
            {Status === "Running" && 
              (
                <div className="greyBackground">
                  <label style={runningStyle}>Experiment is running</label>
                  <MDBBtn color={"elegant"} className={`login-btn viewCodeButton`} onClick={this.handleViewGameCode}>{"View Game Code"}</MDBBtn>
                </div>
              )
            }
            { 
              startStopFinished ? 
                <MDBBtn 
                  color={codeButtonColor} 
                  className={`popUpButton login-btn ${endStartColor}`}
                  onClick={codeButtonFunction}
                >
                  {buttonText}
                </MDBBtn>
              :
                <ClipLoader size={45} color={"#123abc"} loading={true} />
            }
          </div>
          <div className="clear" />
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="info-tab" data-toggle="tab" href="#info" role="tab" aria-controls="info" aria-selected="true">Info</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="gameSettings-tab" data-toggle="tab" href="#gameSettings" role="tab" aria-controls="gameSettings" aria-selected="false">Game Settings</a>
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
              {
                experimentLoaded ? 
                (
                  <div>
                    <h2>{Title}</h2>
                    <p>Created: {CreationDate}</p>
                    <p>Status: {Status}</p>
                    <p>Details: {Details}</p>
                    <p>Disability: {disability[Disability - 1]}</p>
                  </div>
                ) 
                : this.renderWaitForExperiment()
              }
            </div>
            <div className="tab-pane fade" id="gameSettings" role="tabpanel" aria-labelledby="gameSettings-tab">
              {
                experimentLoaded ? 
                (
                  <div>
                    <p>Character skin: {characterType[CharacterType - 1]}</p>
                    <p>Color settings: {colorSettings[ColorSettings - 1]}</p>
                    <p>Round Duration: {RoundDuration} seconds</p>
                    <p>Number of rounds: {RoundsNumber}</p>
                    <p>Rounds:</p>
                    {this.renderRounds()}
                  </div>
                )
                :
                this.renderWaitForExperiment()
              }
            </div>
            <div className="tab-pane fade" id="insights" role="tabpanel" aria-labelledby="insights-tab">
              <StudyInsightsMirror studyId={studyId} />
              <StudyInsightsMirror studyId={studyId} />
              <StudyInsightsMirror studyId={studyId} />
              <StudyInsightsMirror studyId={studyId} />
            </div>
            <div className="tab-pane fade" id="review" role="tabpanel" aria-labelledby="insights-tab">Placeholder 4</div>
          </div>
        </div>
      </div>
    )
  } 

  render() {
    const { isLogged, experiment } = this.props
    return experiment ? (isLogged ? (this.renderLogged()) : (<Redirect to='/' />)) : (null)
  }
}

export default connect(mapStateToProps, { ...UserActions, ...ExperimentActions, ...BreadcrumbsActions })(ExperimentPage);
