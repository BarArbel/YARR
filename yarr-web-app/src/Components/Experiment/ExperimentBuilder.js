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
      title: "",
      details: "",
      characterType: "Type 1",
      colorSettings: "Full spectrum",
      roundsNumber: 1,
      roundsSettings: [{ GameMode: 1, Difficulty: 0 }],
      isMsg: false,
      error: false,
      msg: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeMode = this.handleChangeMode.bind(this)
    this.renderRoundSettings = this.renderRoundSettings.bind(this)
    this.handleChangeDifficulty = this.handleChangeDifficulty.bind(this)
    this.handleRoundNumberChange = this.handleRoundNumberChange.bind(this)
  }

  handleSubmit(event){
    const { title, details, characterType, colorSettings, roundsNumber, roundsSettings } = this.state
    const { studyId } = this.props

    const url = 'http://localhost:3003/addExperiment'
    /* fetch request to add experiment */
    const json = {
      studyId: studyId,
      title: title,
      details: details,
      characterType: characterType,
      colorSettings: colorSettings,
      roundsNumber: roundsNumber,
      roundsSettings: roundsSettings
    }

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

  renderRoundSettings() {
    const { roundsSettings } = this.state

    return (
      <div>
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
                  <option value={1}>Mode 1</option>
                  <option value={2}>Mode 2</option>
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
                  <option value={0}>Dynamic</option>
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

  render() {
    const { title, details, characterType, roundsNumber, colorSettings } = this.state
    
    return(
      <div className="experimentBuilder">
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
            onChange={this.handleRoundNumberChange}
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
