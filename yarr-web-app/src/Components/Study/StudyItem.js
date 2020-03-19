import { MDBIcon } from 'mdbreact'
import { Link } from 'react-router-dom'
import React, { Component } from "react";

class StudyItem extends Component {
  render() {
    const { studyId, onDelete } = this.props
    return (
      <div className="studyItem">
        <div>
          <button onClick={() => { onDelete(studyId) }} className="invisButton"><MDBIcon className="trashIcon" icon="trash" /></button>
          <button onClick={this.handleEdit} className="invisButton"><MDBIcon className="editIcon" icon="edit" /></button>
        </div>
        <Link to={`/study/${studyId}`} className="linkHolder">
          {this.props.children}
        </Link>
      </div>
    )
  }
}

export default StudyItem;