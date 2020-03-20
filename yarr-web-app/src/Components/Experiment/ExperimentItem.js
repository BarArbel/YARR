import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { MDBIcon } from 'mdbreact'
import { MDBBtn } from 'mdbreact'
import ExperimentBuilder from './ExperimentBuilder'
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
      characterType: 0,
      colorSettings: 0,
      editExperiment: false,
    }

    this.handleEdit = this.handleEdit.bind(this)
    this.renderCard = this.renderCard.bind(this)
    this.renderEditForm = this.renderEditForm.bind(this)
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this)
  }

  componentDidMount() {
    const { thisExperiment } = this.props
    const { Status, Title, Details, CharacterType, ColorSettings } = thisExperiment
    this.setState({ status: Status, title: Title, details: Details, characterType: CharacterType, colorSettings: ColorSettings })
  }

  handleEdit() {
    const { editExperiment } = this.state
    this.setState({ editExperiment: !editExperiment })
  }

  handleSubmitEdit(updatedExperiment) {
    const { Title, Details, CharacterType, ColorSettings } = updatedExperiment
    this.setState({ title: Title, details: Details, characterType: CharacterType, colorSettings: ColorSettings })
    this.handleEdit()
  }

  renderCard() {
    const { onDelete, experimentId, studyId } = this.props

    return (
      <div className = "experimentItem">
        <div>
          <button onClick={() => { onDelete(experimentId) }} className="invisButton"><MDBIcon className="trashIcon" icon="trash" /></button>
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
