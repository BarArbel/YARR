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
      characterType: 1,
      colorSettings: 1,
      roundsNumber: 1,
      roundsSettings: [{ GameMode: 1, Difficulty: 0 }]
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeMode = this.handleChangeMode.bind(this)
    this.renderRoundSettings = this.renderRoundSettings.bind(this)
    this.handleChangeDifficulty = this.handleChangeDifficulty.bind(this)
    this.handleRoundNumberChange = this.handleRoundNumberChange.bind(this)
  }

  componentDidMount() {
    const { editForm, currExperiment } = this.props

    editForm && this.setState({ 
      title: currExperiment.Title,
      details: currExperiment.Details,
      characterType: currExperiment.CharacterType,
      colorSettings: currExperiment.ColorSettings,
      roundsNumber: currExperiment.RoundsNumber,
      roundsSettings: currExperiment.RoundsSettings
    })
  }

  handleSubmit(event){
    let { title, details, characterType, colorSettings, roundsNumber, roundsSettings } = this.state
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
      characterType: characterType,
      colorSettings: colorSettings,
      roundsNumber: roundsNumber,
      roundsSettings: roundsSettings,
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
            currExperiment.CharacterType = characterType
            currExperiment.ColorSettings = colorSettings
            onSubmit(currExperiment)
            handleUpdateExperiment(
              currExperiment.ExperimentId,
              currExperiment.Title,
              currExperiment.Details,
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

  render() {
    const { title, details, characterType, roundsNumber, colorSettings } = this.state
    const { status, editForm } = this.props
    
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
          {editForm === false ?
            <div>
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
            </div> : (null)
          }
          {(editForm === false || status === "Ready") ?
            <div>
              <label htmlFor="defaultFormExperimentCharacter" className="grey-text">
                Character Skin
              </label>
              <select
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
                <option value={1}>Full spectrum vision</option>
                <option value={2}>Red-green color blindness</option>
                <option value={3}>Blue-yellow color blindness</option>
              </select>
            </div> : (null)
          }
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
