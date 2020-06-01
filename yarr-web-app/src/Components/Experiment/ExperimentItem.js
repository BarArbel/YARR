import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import React, { Component } from 'react'
import { MDBIcon, MDBBtn } from 'mdbreact'
import CodeView from '../Utilities/CodeView'
import { confirmAlert } from 'react-confirm-alert'
import ExperimentBuilder from './ExperimentBuilder'
import 'react-confirm-alert/src/react-confirm-alert.css'
import DeleteConfirmation from '../Utilities/DeleteConfirmation'
import ExperimentActions from "../../Actions/ExperimentActions"
import SnackbarActions from '../../Actions/SnackbarActions'


const mapStateToProps = ({ user, experiment }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey,
    experimentList: experiment.experimentList
  }
}

export class ExperimentItem extends Component {
  _isMounted = false
  constructor(props) {
    super(props)

    this.state = {
      status: "",
      title: "",
      details: "",
      disability: 0,
      characterType: 0,
      colorSettings: 0,
      interrupted: false,
      editExperiment: false
    }

    this.handleEdit = this.handleEdit.bind(this)
    this.renderCard = this.renderCard.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.renderEditForm = this.renderEditForm.bind(this)
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this)
    this.handleViewGameCode = this.handleViewGameCode.bind(this)
    this.handleStartExperiment = this.handleStartExperiment.bind(this)
    this.checkInterruptedInstances = this.checkInterruptedInstances.bind(this)
  }

  componentDidMount() {
    this._isMounted = true
    const { thisExperiment } = this.props
    const { Status, Title, Details, Disability, CharacterType, ColorSettings, GameCode } = thisExperiment
    this._isMounted && this.setState({
      status: Status,
      title: Title,
      details: Details,
      disability: Disability,
      characterType: CharacterType,
      colorSettings: ColorSettings,
      gameCode: GameCode
    })

    this.checkInterruptedInstances()
  }

  componentWillUnmount() {
    this._isMounted = false
  }
  
  checkInterruptedInstances() {
    const { experimentId, userInfo, bearerKey } = this.props
    const url = `https://yarr-experiment-service.herokuapp.com/getInterruptedInstances?experimentId=${experimentId}`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => { 
      res.status === 200 && res.json().then(json => {
        if (json.result === "Success") {
          json.data.length && this._isMounted && this.setState({ interrupted: true })
        }
        else {
          // No interrupted here        
        }
    })
    })
      .catch(err => {
        console.log(err)
      })

  }

  handleDelete() {
    const { onDelete, thisExperiment } = this.props
    const { Title, ExperimentId } = thisExperiment
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <DeleteConfirmation
            onClose={onClose}
            onDelete={onDelete}
            objectId={ExperimentId}
            objectType="experiment"
            subType="rounds"
            objectTitle={Title}
          />
        )
      }
    })
  }

  handleEdit() {
    const { editExperiment } = this.state
    const { toggleEdit } = this.props
    this._isMounted && this.setState({ editExperiment: !editExperiment })
    toggleEdit(!editExperiment)
  }

  handleSubmitEdit(updatedExperiment) {
    const { Title, Details, Disability, CharacterType, ColorSettings } = updatedExperiment
    this._isMounted && this.setState({
      title: Title,
      details: Details,
      disability: Disability,
      characterType: CharacterType,
      colorSettings: ColorSettings
    })
    this.handleEdit()
  }

  handleStartExperiment(experimentId) {
    const { userInfo, bearerKey, handleChangeExperimentStatus, handleShowSnackbar, thisExperiment } = this.props
    const url = `https://yarr-experiment-service.herokuapp.com/startExperiment`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey,
      experimentId: experimentId
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => { 
      if(res.status === 200) {
        res.json().then(json => {
          if (json.result === "Success") {
            handleShowSnackbar({ msg: `Experiment ${thisExperiment.Title} Is Now Running`, severity: "success" })
            handleChangeExperimentStatus(experimentId, { status: "Running", gameCode: json.gameCode })
            this._isMounted && this.setState({ gameCode: json.gameCode })
          }
          else handleShowSnackbar({ msg: `Failed To Start Experiment ${thisExperiment.Title}`, severity: "error" })
        })
      }
      else handleShowSnackbar({ msg: `Failed To Start Experiment ${thisExperiment.Title}`, severity: "error" })
    })
      .catch(err => handleShowSnackbar({ msg: `Failed To Start Experiment ${thisExperiment.Title}`, severity: "error" }))
  }

  handleViewGameCode() {
    const { thisExperiment } = this.props
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CodeView
            onClose={onClose}
            gameCode={thisExperiment.GameCode}
          />
        )
      }
    })
  }

  renderCard() {
    const { interrupted } = this.state
    const { experimentId, studyId, thisExperiment } = this.props
    const gameCode = thisExperiment.GameCode
    const codeButtonText = gameCode === "null" ? "Start Experiment" : "View Game Code"
    const codeButtonColor = gameCode === "null" ? "success" : "elegant"
    const greenColor = gameCode === "null" ? "greenButton" : null
    const codeButtonFunction = gameCode === "null" ? this.handleStartExperiment : this.handleViewGameCode
    
    return (
      <div className = "experimentItem">
        <div>
          <button onClick={this.handleDelete} className="invisButton"><MDBIcon className="trashIcon" icon="trash" /></button>
          {thisExperiment.Status !== "Running" && <button onClick={this.handleEdit} className="invisButton"><MDBIcon className="editIcon" icon="edit" /></button>}
        </div>
        <Link to={`/study/${studyId}/experiment/${experimentId}`} className="linkHolder">
          {this.props.children}
        </Link>
        <MDBBtn color={codeButtonColor} className={`login-btn codeButton ${greenColor}`} onClick={() => codeButtonFunction(experimentId)}>{codeButtonText}</MDBBtn>
        {interrupted && <p className="interruptedIndicator">This experiment has unfinished games!</p>}
      </div>
    )
  }

  renderEditForm() {
    const { status } = this.state
    const { thisExperiment } = this.props

    return (
      <div>
        <label />
        <MDBBtn color="blue-grey" onClick={() => this.handleEdit(thisExperiment)} className="login-btn addStudy">Cancel</MDBBtn>
        <ExperimentBuilder editForm={true} currExperiment={thisExperiment} onSubmit={this.handleSubmitEdit} status={status}/>
      </div>
    )
  }

  render() {
    const { editExperiment } = this.state
    
    return (
      <div>
        {editExperiment ? this.renderEditForm() : this.renderCard() }
      </div>
    )
  }
}

ExperimentItem.propTypes = {
  experimentId: PropTypes.number,
  studyId: PropTypes.number,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func
};

export default connect(mapStateToProps, { ...ExperimentActions, ...SnackbarActions })(ExperimentItem)
