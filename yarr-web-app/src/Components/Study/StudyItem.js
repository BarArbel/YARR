import { MDBIcon } from 'mdbreact'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import React, { Component } from "react"
import StudyBuilder from './StudyBuilder'
import { confirmAlert } from 'react-confirm-alert'
import StudyActions from '../../Actions/StudyActions'
import 'react-confirm-alert/src/react-confirm-alert.css'
import DeleteConfirmation from '../DeleteConfirmation'
import { withRouter } from "react-router";

const mapStateToProps = ({ study }) => {
  return {
    editStudy: study.editStudy,
    studies: study.studies
  }
}

class StudyItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      title: "",
      description: "",
      editStudy: false,
      studyQuestions: "",
    }

    this.handleEdit = this.handleEdit.bind(this)
    this.renderCard = this.renderCard.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.renderEditForm = this.renderEditForm.bind(this)
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this)
  }

  componentDidMount() {
    const { study } = this.props
    const { Title, StudyQuestions, Description } = study
    this.setState({ title: Title, studyQuestions: StudyQuestions, description: Description })
  }

  handleDelete() {
    const { onDelete, study } = this.props
    const { Title, StudyId } = study
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <DeleteConfirmation 
            onClose={onClose}
            onDelete={onDelete}
            objectId={StudyId}
            objectType="study"
            subType="experiments"
            objectTitle={Title}
          />
        )
      }
    })
  }

  handleEdit() {
    const { editStudy } = this.state
    const { toggleEdit } = this.props
    toggleEdit(!editStudy)
    this.setState({ editStudy: !editStudy })
  }

  handleSubmitEdit(updatedStudy) {
    const { Title, StudyQuestions, Description } = updatedStudy
    this.setState({ title: Title, studyQuestions: StudyQuestions, description: Description, currStudy: updatedStudy })
    this.handleEdit()
  }

  renderCard() {
    const { studyId } = this.props

    return (
      <div className="card">
        <div className="card-body">
          <button onClick={this.handleDelete} className="invisButton"><MDBIcon className="trashIcon" icon="trash" /></button>
          <button onClick={this.handleEdit} className="invisButton"><MDBIcon className="editIcon" icon="edit" /></button>
          <Link to={`/study/${studyId}`} className="linkHolder">
            {this.props.children}
          </Link>
        </div>
      </div>
    )
  }

  renderEditForm() {
    const { study } = this.props
    return (
      <div>
        <label />
        <MDBBtn color="blue-grey" onClick={() => this.handleEdit(study)} className="login-btn addStudy">Go Back</MDBBtn>
        <StudyBuilder editForm={true} currStudy={study} onSubmit={this.handleSubmitEdit}/>
      </div>
    )
  }

  render() {
    const { editStudy } = this.state
    
    return (
      <div className="studyItem">
        {editStudy ? this.renderEditForm() : this.renderCard() }
      </div>
    )
  }
}

export default connect(mapStateToProps, { ...StudyActions })(withRouter(StudyItem))