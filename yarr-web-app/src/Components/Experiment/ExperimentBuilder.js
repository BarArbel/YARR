import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MDBBtn } from 'mdbreact'
import PropTypes from 'prop-types'
import UserActions from '../../Actions/UserActions'
import ExperimentActions from '../../Actions/ExperimentActions'

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
      colorSettings: 1
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleRoundNumberChange = this.handleRoundNumberChange.bind(this)
    this.handleChangeMode = this.handleChangeMode.bind(this)
    this.handleChangeDifficulty = this.handleChangeDifficulty.bind(this)
    this.handleChangeSection = this.handleChangeSection.bind(this)
    this.renderInfo = this.renderInfo.bind(this)
    this.renderRoundSettings = this.renderRoundSettings.bind(this)
    this.renderDisability = this.renderDisability.bind(this)
    this.renderVisualSettings = this.renderVisualSettings.bind(this)
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
    const url = editForm ? 'http://localhost:3003/updateExperiment' : 'http://localhost:3003/addExperiment'

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
        }
        else {
          // do something
        }
      })
      .catch(err => {
        console.log(err)
          // do something
      })
  }

  handleChange(event) {
    const { name, value } = event.target

    this.setState({ [name] : value });
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

  handleChangeMode(value, index){
    const { roundsSettings } = this.state
    roundsSettings[index].GameMode = parseInt(value)
    this.setState({roundsSettings: roundsSettings})
  }

  handleChangeDifficulty(value, index){
    const { roundsSettings } = this.state
    roundsSettings[index].Difficulty = parseInt(value)
    this.setState({ roundsSettings: roundsSettings })
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
      this.setState({ wizardIndex: wizardIndex + offset })
    } else if(direction === "back") {
      this.setState({ wizardIndex: wizardIndex - offset })
    }
  }

  renderInfo() {
    const { title, details } = this.state

    return(
      <div>
        <label htmlFor="defaultFormExperimentTitle" className="grey-text">
          Experiment Title
        </label>
        <input
          value={title}
          onChange={this.handleChange}
          id="defaultFormExperimentTitle"
          className="form-control FormMargins"
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
          className="form-control FormMargins"
          name="details"
          rows="5"
          maxLength="4096"
          required
        />
      </div>
    )
  }

  renderRoundSettings() {
    const { roundsNumber, roundDuration, roundsSettings } = this.state

    return (
      <div>
        <label htmlFor="defaultFormExperimentRoundDuration" className="grey-text">
          Round Duration: {roundDuration} seconds
        </label>
        <input
          value={roundDuration}
          onChange={this.handleChange}
          id="defaultFormExperimentRoundDuration"
          className="form-control FormMargins"
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
          required
        />
        <label className="grey-text">Rounds Settings</label>
        <ul>
          {roundsSettings.map((value, index) => {
            return (
              <div key={`round${index}`}>
                <p className="grey-text"><b>Round {index + 1}</b></p>
                <p htmlFor={`defaultFormExperimentMode${index}`} className="grey-text">
                  Game Mode
                </p>
                <select
                  value={value.GameMode}
                  onChange={ event => { this.handleChangeMode(event.target.value, index) }}
                  id={`defaultFormExperimentMode${index}`}
                  className="form-control FormMargins"
                  name={`mode${index}`}
                  required
                >
                  <option value={1}>Cooperative</option>
                  <option value={2}>Competitive</option>
                </select>
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
            )
          })}
        </ul>
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
    const { characterType, colorSettings } = this.state

    return(
      <div>
        <label htmlFor="defaultFormExperimentCharacter" className="grey-text">
          Character Skin
        </label>
        <div className="form-check FormMargin">
          <input
            value={1}
            onChange={this.handleChange}
            id="defaultFormExperimentCharacter"
            className="form-check-input FormMargins"
            name="characterType"
            type="radio"
            required
          />
          <label className="form-check-label" htmlFor="defaultFormExperimentCharacter">Characters differentiated by color</label>
        </div>
        <img
          src={ require("../../Images/different_colors.png") }
          alt="Characters differentiated by color"
          className="builderImage FormMargin"
        />
        <div className="form-check FormMargin">
          <input
            value={2}
            onChange={this.handleChange}
            id="defaultFormExperimentCharacter"
            className="form-check-input FormMargins"
            name="characterType"
            type="radio"
            required
          />
          <label className="form-check-label" htmlFor="defaultFormExperimentCharacter">Characters differentiated by shapes</label>
        </div>
        <img
          src={ require("../../Images/different_shapes.png") }
          alt="Characters differentiated by shapes"
          className="builderImage FormMargin"
        />
        <div className="form-check FormMargin">
          <input
            value={3}
            onChange={this.handleChange}
            id="defaultFormExperimentCharacter"
            className="form-check-input FormMargins"
            name="characterType"
            type="radio"
            required
          />
          <label className="form-check-label" htmlFor="defaultFormExperimentCharacter">Characters differentiated by design</label>
        </div>
        <img
          src={ require("../../Images/different_design.png") }
          alt="Characters differentiated by design"
          className="builderImage FormMargin"
        />
        {/*<select
          value={characterType}
          onChange={this.handleChange}
          id="defaultFormExperimentCharacter"
          className="form-control FormMargins"
          name="characterType"
          required
        >
          <option value={1}>Characters differentiated by color</option>
          <option value={2}>Characters differentiated by shapes</option>
          <option value={3}>Characters differentiated by design</option>
        </select>*/}
        <br/>
        <label htmlFor="defaultFormExperimentColor" className="grey-text">
          Color Settings
        </label>
        <div className="form-check FormMargin">
          <input
            value={1}
            onChange={this.handleChange}
            id="defaultFormExperimentColor"
            className="form-check-input FormMargins"
            name="colorSettings"
            type="radio"
            required
          />
          <label className="form-check-label" htmlFor="defaultFormExperimentColor">Full spectrum vision</label>
        </div>
        <img
          src={ require("../../Images/full_spectrum_vision.jpg") }
          alt="Full spectrum vision"
          className="builderImage FormMargin"
        />
        <div className="form-check FormMargin">
          <input
            value={2}
            onChange={this.handleChange}
            id="defaultFormExperimentColor"
            className="form-check-input FormMargins"
            name="colorSettings"
            type="radio"
            required
          />
          <label className="form-check-label" htmlFor="defaultFormExperimentColor">Red-green color settings</label>
        </div>
        <img
          src={ require("../../Images/red_green_color_blindness.jpg") }
          alt="Red-green color blindness"
          className="builderImage FormMargin"
        />
        <div className="form-check FormMargin">
          <input
            value={3}
            onChange={this.handleChange}
            id="defaultFormExperimentColor"
            className="form-check-input FormMargins"
            name="colorSettings"
            type="radio"
            required
          />
          <label className="form-check-label" htmlFor="defaultFormExperimentColor">Blue-yellow color blindness</label>
        </div>
        <img
          src={ require("../../Images/blue_yellow_color_blindness.jpg") }
          alt="Blue-yellow color blindness"
          className="builderImage FormMargin"
        />
        {/*<select
          value={colorSettings}
          onChange={this.handleChange}
          id="defaultFormExperimentColor"
          className="form-control FormMargins"
          name="colorSettings"
          required
        >
          <option value={1}>Full spectrum vision</option>
          <option value={2}>Red-green color blindness</option>
          <option value={3}>Blue-yellow color blindness</option>
        </select>*/}
      </div>
    )
  }

  render() {
    const { wizardIndex } = this.state
    const { status } = this.props
    
    return(
      <div className="experimentBuilder">
        <form onSubmit={this.handleSubmit}>
          <p className="h4 text-center mb-4">Create Experiment</p>
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
                <MDBBtn color="elegant" type="submit" className="login-btn">Save Experiment</MDBBtn>
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
