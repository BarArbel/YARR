import React, { Component } from "react";
import { Link } from 'react-router-dom'

class StudyItem extends Component {
  render() {
    const { studyId } = this.props
    return (
      <div className="studyItem">
        <Link to={`/study/${studyId}`} className="linkHolder">
          {this.props.children}
        </Link>
      </div>
    )
  }
}

export default StudyItem;