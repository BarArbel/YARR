import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MDBBtn } from 'mdbreact'
import PropTypes from 'prop-types'
import UserActions from '../../Actions/UserActions'
import ExperimentActions from '../../Actions/ExperimentActions'
import "react-step-progress-bar/styles.css"
import { ProgressBar, Step } from "react-step-progress-bar"

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
  }
}

class ExperimentBuilder extends Component {
  constructor(props) {
    super(props)

    this.state = {
      wizardIndex: 0,
      title: "",
      details: "",
      roundsNumber: 1,
      roundDuration: 180,
      roundsSettings: [{ GameMode: 1, Difficulty: 0 }],
      disability: 1,
      characterType: 1,
      colorSettings: 1,
      nextPressed: false
    }

    this.renderInfo = this.renderInfo.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.checkProgress = this.checkProgress.bind(this)
    this.handleChangeMode = this.handleChangeMode.bind(this)
    this.renderDisability = this.renderDisability.bind(this)
    this.renderProgressBar = this.renderProgressBar.bind(this)
    this.handleChangeSection = this.handleChangeSection.bind(this)
    this.renderRoundSettings = this.renderRoundSettings.bind(this)
    this.renderVisualSettings = this.renderVisualSettings.bind(this)
    this.handleChangeDifficulty = this.handleChangeDifficulty.bind(this)
    this.handleRoundNumberChange = this.handleRoundNumberChange.bind(this)
  }

  componentDidMount() {
    const { editForm, currExperiment } = this.props

    editForm && this.setState({ 
      title: currExperiment.Title,
      details: currExperiment.Details,
      roundsNumber: currExperiment.RoundsNumber,
      roundDuration: currExperiment.RoundDuration,
      roundsSettings: currExperiment.RoundsSettings,
      disability: currExperiment.Disability,
      characterType: currExperiment.CharacterType,
      colorSettings: currExperiment.ColorSettings
    })
  }

  renderProgressBar() {
    const { wizardIndex } = this.state
    const { editForm } = this.props
    const steps = editForm ? 3 : 4
    const tempIndex = wizardIndex > 1 ? wizardIndex - 1 : wizardIndex
    return (
      <div style={{ marginBottom: "20px", marginTop: "10px" }} >
      {editForm ? 
        <ProgressBar percent={(tempIndex) / (steps)* 100 + 1}>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              {index + 1}
            </div>
          )}
        </Step>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              {index + 1}
            </div>
          )}
        </Step>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              {index + 1}
            </div>
          )}
        </Step>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              V
            </div>
          )}
        </Step>
      </ProgressBar>
      :
      <ProgressBar percent={(wizardIndex / steps) * 100}>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              {index + 1}
            </div>
          )}
        </Step>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              {index + 1}
            </div>
          )}
        </Step>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              {index + 1}
            </div>
          )}
        </Step>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              {index + 1}
            </div>
          )}
        </Step>
        <Step>
          {({ accomplished, index }) => (
            <div
              className={`indexedStep ${accomplished ? "accomplished" : null}`}
            >
              V
            </div>
          )}
        </Step>
      </ProgressBar>
      }
    </div>
    )
  }

  handleSubmit(event){
    let {
      title,
      details,
      roundsNumber,
      roundDuration,
      roundsSettings,
      disability,
      characterType,
      colorSettings
    } = this.state
    const {
      studyId,
      editForm,
      currExperiment,
      onSubmit,
      handleUpdateExperiment,
      handleToggleBuildExperiment
    } = this.props
    let url = 'https://yarr-experiment-service.herokuapp.com'
    url += editForm ? '/updateExperiment' : '/addExperiment'

    /* fetch request to add experiment */
    const json = {
      studyId: studyId,
      title: title,
      details: details.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t"),
      roundsNumber: roundsNumber,
      roundDuration: roundDuration,
      roundsSettings: roundsSettings,
      disability: disability,
      characterType: characterType,
      colorSettings: colorSettings,
      experimentId: editForm ? currExperiment.ExperimentId : undefined
    }

    console.log(json)
    event.preventDefault()

    fetch(url, {
      method: editForm ? 'PUT' : 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          if(editForm) {
            currExperiment.Title = title
            currExperiment.Details = details
            currExperiment.Disability = disability
            currExperiment.CharacterType = characterType
            currExperiment.ColorSettings = colorSettings
            onSubmit(currExperiment)
            handleUpdateExperiment(
              currExperiment.ExperimentId,
              currExperiment.Title,
              currExperiment.Details,
              currExperiment.Disability,
              currExperiment.CharacterType,
              currExperiment.ColorSettings
            )
          }
          else {
            handleToggleBuildExperiment()
          }
          console.log(json)
        }
        else {
        }
      })
      .catch(err => {
        console.log(err)
          // do something
      })
  }

  handleChange(event) {
    const { name, value } = event.target

    this.setState({ [name] : value })
  }

  handleRoundNumberChange(event) {
    const value = parseInt(event.target.value)
    const { roundsNumber, roundsSettings } = this.state

    /* Minimum reached */
    if (value < 1) {
      return
    }   

    /* Add one */
    if (value > roundsNumber && value > roundsSettings.length) {
      this.setState({ roundsNumber: value, roundsSettings: [...roundsSettings, { GameMode: 1, Difficulty: 0 }] })
    }
    /* Remove last */ 
    else if (value < roundsNumber && value < roundsSettings.length) {
      let tempList = roundsSettings
      tempList.splice(tempList.length - 1, 1)
      this.setState({ roundsNumber: value, roundsSettings: tempList })
    }
  }

  handleChangeMode(value, index) {
    const { roundsSettings } = this.state
    roundsSettings[index].GameMode = parseInt(value)
    this.setState({roundsSettings: roundsSettings})
  }

  handleChangeDifficulty(value, index) {
    const { roundsSettings } = this.state
    roundsSettings[index].Difficulty = parseInt(value)
    this.setState({ roundsSettings: roundsSettings })
  }

  checkProgress() {
    const { wizardIndex } = this.state
    if(wizardIndex === 0) {
      const { title, details } = this.state
      if(!title.length || !details.length) {
        return false
      }
    }
    return true
  }

  handleChangeSection(direction) {
    const { wizardIndex } = this.state
    const { editForm } = this.props
    let offset = 1

    if(wizardIndex === 0 && editForm === true) {
      offset = 2
    } else if(wizardIndex === 2 && direction === "back" && editForm === true) {
      offset = 2
    }

    if(direction === "next"){
      if(this.checkProgress() === true) {
        this.setState({ wizardIndex: wizardIndex + offset })
      }
      else this.setState({ nextPressed: true })

    } else if(direction === "back") {
      this.setState({ wizardIndex: wizardIndex - offset })
    }
  }

  renderInfo() {
    const { title, details, nextPressed } = this.state
    const titleClass = nextPressed && !title.length ? "redBorder form-control FormMargins" : "form-control FormMargins"
    const detailsClass = nextPressed && !details.length ? "redBorder form-control FormMargins" : "form-control FormMargins"

    return(
      <div>
        <label htmlFor="defaultFormExperimentTitle" className="grey-text">
          Experiment Title
        </label>
        <input
          value={title}
          onChange={this.handleChange}
          id="defaultFormExperimentTitle"
          className={titleClass}
          name="title"
          required
        />
        <label htmlFor="defaultFormExperimentDetails" className="grey-text">
          Experiment Details
        </label>
        <textarea
          value={details}
          onChange={this.handleChange}
          id="defaultFormExperimentDetails"
          className={detailsClass}
          name="details"
          rows="5"
          maxLength="4096"
        />
      </div>
    )
  }

  renderRoundSettings() {
    const { roundsNumber, roundDuration, roundsSettings } = this.state

    return (
      <div>
        <p style={{ textAlign: "center", color: "#B33A3A" }}><b>Please note that these settings CAN NOT be modified once saved</b></p>
        <label htmlFor="defaultFormExperimentRoundDuration" className="grey-text">
          Round Duration: {roundDuration} seconds
        </label>
        <input
          value={roundDuration}
          onChange={this.handleChange}
          id="defaultFormExperimentRoundDuration"
          className="custom-range"
          name="roundDuration"
          type="range"
          min="60"
          max="300"
          required
        />
        <label htmlFor="defaultFormExperimentRoundsNumber" className="grey-text">
          Number of Rounds
        </label>
        <input
          value={roundsNumber}
          onChange={this.handleRoundNumberChange}
          id="defaultFormExperimentRoundsNumber"
          className="form-control FormMargins"
          name="roundsNumber"
          type="number"
          onKeyPress={event => {event.preventDefault()}}
          required
        />
        <label className="grey-text">Rounds Settings</label>
          {roundsSettings.map((value, index) => {
            const gameMode = this.state.roundsSettings[index].GameMode
            const gameModeText = [
              "Gameplay that allows players to work together as teammates to achieve a mutual goal.",
              "A player can either win or lose - to the game environment or to another player."
            ]
            return (
              <div className="card" key={`round${index}`}>
                <div className="card-body">
                  <p className="grey-text"><b>Round {index + 1}</b></p>
                  <label htmlFor={`defaultFormExperimentMode${index}`} className="grey-text">
                    Game Mode
                  </label>
                  <select
                    value={value.GameMode}
                    onChange={ event => { this.handleChangeMode(event.target.value, index) }}
                    id={`defaultFormExperimentMode${index}`}
                    className="form-control"
                    name={`mode${index}`}
                    required
                  >
                    <option value={1}>Cooperative</option>
                    <option value={2}>Competitive</option>
                  </select>
                  <p className="modeExplanation">{gameModeText[gameMode - 1]}</p>
                  <label htmlFor={`defaultFormExperimentDifficulty${index}`} className="grey-text">
                    Difficulty
                  </label>
                  <select
                    value={value.Difficulty}
                    onChange={event => { this.handleChangeDifficulty(event.target.value, index) }}
                    id={`defaultFormExperimentDifficulty${index}`}
                    className="form-control FormMargins"
                    name={`difficulty${index}`}
                    required
                  >
                    <option value={0}>Adaptive</option>
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                    <option value={4}>Level 4</option>
                    <option value={5}>Level 5</option>
                    <option value={6}>Level 6</option>
                  </select>
                </div>
              </div>
            )
          })}
      </div>
    )
  }

  renderDisability() {
    const { disability } = this.state

    return(
      <div>
        <label htmlFor="defaultFormExperimentDisability" className="grey-text">
          Disability
        </label>
        <select
          value={disability}
          onChange={this.handleChange}
          id="defaultFormExperimentDisability"
          className="form-control FormMargins"
          name="disability"
          required
        >
          <option value={1}>No disability</option>
          <option value={2}>Tetraplegia\Quadriplegia</option>
          <option value={3}>Color blindness</option>
        </select>
      </div>
    )
  }

  renderVisualSettings() {
    const { characterType, disability, colorSettings } = this.state
    const tempType = parseInt(characterType)
    const tempColor = parseInt(colorSettings)

    return(
      <div>
        <label className="grey-text">
          Character Skin
        </label>
        <ul>
          <div className="inputPicHolder">
            <input
              value={1}
              onChange={this.handleChange}
              id="color"
              name="characterType"
              type="radio"
              className="hideRadio"
              required
            />
            <label htmlFor="color" className="imageLableInput">
              Characters differentiated by color
              <img
                src={ require("../../Images/different_colors.png") }
                alt="Characters differentiated by color"
                className={tempType === 1 ? "selectedVisual builderImage inputImage" : "builderImage inputImage"}
              />
            </label>
          </div>
          <div className="inputPicHolder">
            <input
              value={2}
              onChange={this.handleChange}
              id="shapes"
              name="characterType"
              type="radio"
              className="hideRadio"
              required
            />
            <label htmlFor="shapes" className="imageLableInput">
              Characters differentiated by shapes
              <img
                src={ require("../../Images/different_shapes.png") }
                alt="Characters differentiated by shapes"
                className={tempType === 2 ? "selectedVisual builderImage inputImage" : "builderImage inputImage"}
              />
            </label>
          </div>
          <div className="inputPicHolder">
            <input
              value={3}
              onChange={this.handleChange}
              id="design"
              name="characterType"
              type="radio"
              className="hideRadio"
              required
            />
            <label htmlFor="design" className="imageLableInput">
              Characters differentiated by design          
              <img
                src={ require("../../Images/different_design.png") }
                alt="Characters differentiated by design"
                className={tempType === 3 ? "selectedVisual builderImage inputImage" : "builderImage inputImage"}
              />
              </label>
          </div>
        </ul>
        {disability === "3" ? 
        (
            <div>
              <div className="clear" />
              <label className="grey-text">
                Color Settings
              </label>
                <ul>
                  <div className="inputPicHolder">
                    <input
                      value={1}
                      onChange={this.handleChange}
                      id="full"
                      className="hideRadio"
                      name="colorSettings"
                      type="radio"
                      required
                    />
                    <label className="imageLableInput" htmlFor="full">
                      Full spectrum vision
                      <img
                        src={require("../../Images/full_spectrum_vision.jpg")}
                        alt="Full spectrum vision"
                        className={tempColor === 1 ? "selectedVisual builderImage inputImage" : "builderImage inputImage"}
                      />
                    </label>
                  </div>
                    <div className="inputPicHolder">
                    <input
                      value={2}
                      onChange={this.handleChange}
                      id="redGreen"
                      className="hideRadio"
                      name="colorSettings"
                      type="radio"
                      required
                    />
                    <label className="imageLableInput" htmlFor="redGreen">
                      Red-green color blindness
                      <img
                        src={require("../../Images/red_green_color_blindness.jpg")}
                        alt="Red-green color blindness"
                        className={tempColor === 2 ? "selectedVisual builderImage inputImage" : "builderImage inputImage"}
                      />
                    </label>
                  </div>
                  <div className="inputPicHolder">
                    <input
                      value={3}
                      onChange={this.handleChange}
                      id="blueYellow"
                      className="hideRadio"
                      name="colorSettings"
                      type="radio"
                      required
                    />
                    <label className="imageLableInput" htmlFor="blueYellow">
                      Blue-yellow color blindness
                      <img
                        src={require("../../Images/blue_yellow_color_blindness.jpg")}
                        alt="Blue-yellow color blindness"
                        className={tempColor === 3 ? "selectedVisual builderImage inputImage" : "builderImage inputImage"}
                      />
                    </label>
                  </div>
                </ul>
            </div>
          )
        : null}
        <div className="clear"/>
      </div>
    )
  }

  render() {
    const { wizardIndex } = this.state
    const { status } = this.props
    
    return(
      <div className="experimentBuilder">
        <form>
          <p className="h4 text-center mb-4">Create Experiment</p>
          {this.renderProgressBar()}
          {wizardIndex === 0 ?
            <div>
              <p className="h4 text-center mb-4">Experiment Info</p>
              {this.renderInfo()}
            </div> : (null)
          }
          {wizardIndex === 1 ?
            <div>
              <p className="h4 text-center mb-4">Rounds Settings</p>
              {this.renderRoundSettings()}
            </div> : (null)
          }
          {wizardIndex === 2 ?
            <div>
              <p className="h4 text-center mb-4">Disability</p>
              {this.renderDisability()}
            </div> : (null)
          }
          {wizardIndex === 3 ?
            <div>
              <p className="h4 text-center mb-4">Visual Settings</p>
              {this.renderVisualSettings()}
            </div> : (null)
          }
          <div className="form-row">
            {wizardIndex !== 0 ?
              <div className="text-center mt-4">
                <MDBBtn color="elegant" className="login-btn" onClick={() => this.handleChangeSection("back")}>Back</MDBBtn>
              </div> : (null)
            }
            {(wizardIndex !== 3 && (status === "Ready" || status === undefined)) ?
              <div className="text-center mt-4">
                <MDBBtn color="elegant" className="login-btn" onClick={() => this.handleChangeSection("next")}>Next</MDBBtn>
              </div> : (null)
            }
            {(wizardIndex === 3 || (wizardIndex === 0 && status !== "Ready" && status !== undefined)) ?
              <div className="text-center mt-4">
                <MDBBtn color="elegant" onClick={this.handleSubmit} className="login-btn">Save Experiment</MDBBtn>
              </div> : (null)
            }
          </div>
        </form>
      </div>
    )
  }
}

ExperimentBuilder.propTypes = {
  studyId: PropTypes.number,
  userInfo: PropTypes.object,
  isLogged: PropTypes.bool,
  bearerKey: PropTypes.string,
};

export default connect(mapStateToProps, { ...UserActions, ...ExperimentActions })(ExperimentBuilder)
