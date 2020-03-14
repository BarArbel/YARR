import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { MDBBtn } from 'mdbreact'
import PropTypes from 'prop-types'
import Header from '../Header'
import UserActions from '../../Actions/UserActions'
import ExperimentActions from '../../Actions/ExperimentActions'

const mapStateToProps = ({ user, experiment }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    experimentList: experiment.experimentList
  }
}

class ExperimentBuilder extends Component {
  constructor(props) {
    super(props)

    this.state = {
      title: "",
      details: "",
      characterType: "Type 1",
      colorSettings: "Color blind",
      roundsNumber: 1,
      roundsSettings: [],
      isMsg: false,
      error: false,
      msg: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleRoundSettings = this.handleRoundSettings.bind(this)
    this.renderRoundSettings = this.renderRoundSettings.bind(this)
  }

  componentDidMount() {
    this.handleRoundSettings();
  }

  handleSubmit(event){
    const { title, details, characterType, colorSettings, roundsNumber, roundsSettings } = this.state
    const { studyId } = this.props

    const url = 'http://localhost:3001/addExperiment'
    /* fetch request to add experiment */
    const json = {
      StudyId: studyId,
      Title: title,
      Details: details,
      CharacterType: characterType,
      ColorSettings: colorSettings,
      RoundsNumber: roundsNumber,
      RoundsSettings: roundsSettings
    }
    console.log(json)
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          console.log(json)
          this.setState({msg: "success", isMsg: true, error: false})
        }
        else {
          console.log(json)
        }
      })
      .catch(err => console.log(err));
    
    event.preventDefault();
  }

  handleChange(event) {
    const { name, value } = event.target
    if(name === "roundsNumber" && value < 1) {
      return
    }
    this.setState({ [name]: value });
  }

  handleRoundSettings() {
    const { roundsNumber, roundsSettings } = this.state

    if (roundsNumber > roundsSettings.length) {
      let newRounds = []
      for(let i = 0; i < roundsNumber - roundsSettings.length; ++i) {
        newRounds = [...newRounds, { "Mode": "Mode 1", "Difficulty": "Dynamic" }]
      }
      this.setState({ roundsSettings: [...roundsSettings, newRounds] })
    } else if (roundsNumber < roundsSettings.length) {
      let newList = roundsSettings.splice(roundsNumber - roundsSettings.length, roundsSettings.length - roundsNumber)
      this.setState({ roundsSettings: newList })
    }
  }

  renderRoundSettings() {
    const { roundsSettings } = this.state

    this.handleRoundSettings()
    return (
      <div>
        <ul>
          {roundsSettings.map((value, index) => {
            return (
              <div key={index}>
                <label className="grey-text">Round {index + 1}</label>
                <label htmlFor={`defaultFormExperimentMode${index}`} className="grey-text">
                  Game Mode
                </label>
                <select
                  value={value.Mode}
                  onChange={this.handleChange}
                  id={`defaultFormExperimentMode${index}`}
                  className="form-control FormMargins"
                  name={`mode${index}`}
                  required
                >
                  <option value="Mode 1">Mode 1</option>
                  <option value="Mode 2">Mode 2</option>
                </select>
                <label htmlFor={`defaultFormExperimentDifficulty${index}`} className="grey-text">
                  Difficulty
                </label>
                <select
                  value={value.Difficulty}
                  onChange={this.handleChange}
                  id={`defaultFormExperimentDifficulty${index}`}
                  className="form-control FormMargins"
                  name={`difficulty${index}`}
                  required
                >
                  <option value="Dynamic">Dynamic</option>
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Level 4">Level 4</option>
                  <option value="Level 5">Level 5</option>
                  <option value="Level 6">Level 6</option>
                </select>
              </div>
            )
          })}
        </ul>
      </div>
    )
  }

  render() {
    const { title, details, characterType, roundsNumber, roundsSettings, colorSettings } = this.state
    
    return(
      <form onSubmit={this.handleSubmit}>
        <p className="h4 text-center mb-4">Create Experiment</p>
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
        <input
          value={details}
          onChange={this.handleChange}
          id="defaultFormExperimentDetails"
          className="form-control FormMargins"
          name="details"
          required
        />
        <label htmlFor="defaultFormExperimentCharacter" className="grey-text">
          Character Type
        </label>
        <select
          value={characterType}
          onChange={this.handleChange}
          id="defaultFormExperimentCharacter"
          className="form-control FormMargins"
          name="characterType"
          required
        >
          <option value="Type 1">Type 1</option>
          <option value="Type 2">Type 2</option>
          <option value="Type 3">Type 3</option>
        </select>
        <label htmlFor="defaultFormExperimentColor" className="grey-text">
          Color Settings
        </label>
        <select
          value={colorSettings}
          onChange={this.handleChange}
          id="defaultFormExperimentColor"
          className="form-control FormMargins"
          name="colorSettings"
          required
        >
          <option value="Full spectrum">Full spectrum</option>
          <option value="Color blind 1">Color blind 1</option>
          <option value="Color blind 2">Color blind 2</option>
        </select>
        <label htmlFor="defaultFormExperimentRoundsNumber" className="grey-text">
          Number of Rounds
        </label>
        <input
          value={roundsNumber}
          onChange={this.handleChange}
          id="defaultFormExperimentRoundsNumber"
          className="form-control FormMargins"
          name="roundsNumber"
          type="number"
          required
        />
        <label className="grey-text">Rounds Settings</label>
        {this.renderRoundSettings()}
        <div className="text-center mt-4">
          <MDBBtn color="elegant" type="submit" className="login-btn">Save Experiment</MDBBtn>
        </div>
      </form>
    )
  }
}

ExperimentBuilder.propTypes = {
  studyId: PropTypes.number
};

export default connect(mapStateToProps, { ...UserActions, ...ExperimentActions })(ExperimentBuilder)
