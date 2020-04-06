import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import React, { Component } from 'react'
import { MDBIcon, MDBBtn } from 'mdbreact'
import { confirmAlert } from 'react-confirm-alert'
import ExperimentBuilder from './ExperimentBuilder'
import DeleteConfirmation from '../DeleteConfirmation'
import 'react-confirm-alert/src/react-confirm-alert.css'
import ExperimentActions from "../../Actions/ExperimentActions"


const mapStateToProps = ({ experiment }) => {
  return {
    experimentList: experiment.experimentList
  }
}

export class ExperimentItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      status: "",
      title: "",
      details: "",
      disability: 0,
      characterType: 0,
      colorSettings: 0,
      editExperiment: false,
    }

    this.handleEdit = this.handleEdit.bind(this)
    this.renderCard = this.renderCard.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.renderEditForm = this.renderEditForm.bind(this)
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this)
  }

  componentDidMount() {
    const { thisExperiment } = this.props
    const { Status, Title, Details, Disability, CharacterType, ColorSettings } = thisExperiment
    this.setState({
      status: Status,
      title: Title,
      details: Details,
      disability: Disability,
      characterType: CharacterType,
      colorSettings: ColorSettings
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
    this.setState({ editExperiment: !editExperiment })
    toggleEdit(!editExperiment)
  }

  handleSubmitEdit(updatedExperiment) {
    const { Title, Details, Disability, CharacterType, ColorSettings } = updatedExperiment
    this.setState({
      title: Title,
      details: Details,
      disability: Disability,
      characterType: CharacterType,
      colorSettings: ColorSettings
    })
    this.handleEdit()
  }

  renderCard() {
    const { experimentId, studyId } = this.props

    return (
      <div className = "experimentItem">
        <div>
          <button onClick={this.handleDelete} className="invisButton"><MDBIcon className="trashIcon" icon="trash" /></button>
          <button onClick={this.handleEdit} className="invisButton"><MDBIcon className="editIcon" icon="edit" /></button>
        </div>
        <Link to={`/study/${studyId}/experiment/${experimentId}`} className="linkHolder">
          {this.props.children}
        </Link>
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

export default connect(mapStateToProps, { ...ExperimentActions })(ExperimentItem)
