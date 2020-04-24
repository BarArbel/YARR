import Header from '../Header'
import { connect } from 'react-redux'
import Breadcrumbs from '../Breadcrumbs'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserActions from '../../Actions/UserActions'
import ExperimentActions from '../../Actions/ExperimentActions'
import BreadcrumbsActions from '../../Actions/BreadcrumbsActions'
import DifficultyImg from '../../difficulty.png'
import CoopImg from '../../cooperative.png'
import CompImg from '../../competitive.png'
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

    this.renderLogged = this.renderLogged.bind(this)
    this.renderRounds = this.renderRounds.bind(this)
  }

  async componentDidMount() {
    const { handleSetRoutes, handleSelectExperiment, experimentList } = this.props
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

      await fetch(url).then(res => res.json()).then(json => {
        if (json.result === "Success") {
          experiment = json.experiment
        }
      })
      .catch(err => console.log(err));
    } else {
      const idCompare = i => parseInt(i.ExperimentId) === parseInt(experimentId)
      experiment = experimentList.find(idCompare)
    }
    
    handleSetRoutes(routes)
    handleSelectExperiment(experiment)
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

  renderLogged(){
    const { experiment } = this.props
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
      ColorSettings
    } = experiment
    const studyId = this.props.match.params.studyId

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
              <h2>{Title}</h2>
              <p>Created: {CreationDate}</p>
              <p>Status: {Status}</p>
              <p>Details: {Details}</p>
              <p>Disability: {disability[Disability - 1]}</p>
            </div>
            <div className="tab-pane fade" id="gameSettings" role="tabpanel" aria-labelledby="gameSettings-tab">
              <p>Character skin: {characterType[CharacterType - 1]}</p>
              <p>Color settings: {colorSettings[ColorSettings - 1]}</p>
              <p>Round Duration: {RoundDuration} seconds</p>
              <p>Number of rounds: {RoundsNumber}</p>
              <p>Rounds:</p>
              {this.renderRounds()}
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
