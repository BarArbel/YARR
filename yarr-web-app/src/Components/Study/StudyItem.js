import { MDBIcon } from 'mdbreact'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import React, { Component } from "react"
import StudyBuilder from './StudyBuilder'
import StudyActions from '../../Actions/StudyActions'

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
      studyQuestions: "",
      editStudy: false,
    }

    this.handleEdit = this.handleEdit.bind(this)
    this.renderCard = this.renderCard.bind(this)
    this.renderEditForm = this.renderEditForm.bind(this)
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this)
  }

  componentDidMount() {
    const { study } = this.props
    const { Title, StudyQuestions, Description } = study
    this.setState({ title: Title, studyQuestions: StudyQuestions, description: Description })
  }

  handleEdit() {
    const { editStudy } = this.state
    this.setState({ editStudy: !editStudy })
  }

  handleSubmitEdit(updatedStudy) {
    const { Title, StudyQuestions, Description } = updatedStudy
    this.setState({ title: Title, studyQuestions: StudyQuestions, description: Description, currStudy: updatedStudy })
    this.handleEdit()
  }

  renderCard() {
    const { studyId, onDelete } = this.props

    return (
      <div className="card">
        <div className="card-body">
          <button onClick={() => onDelete(studyId)} className="invisButton"><MDBIcon className="trashIcon" icon="trash" /></button>
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
        <MDBBtn color="blue-grey" onClick={() => this.handleEdit(study)} className="login-btn addStudy">Cancel</MDBBtn>
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

export default connect(mapStateToProps, { ...StudyActions })(StudyItem);