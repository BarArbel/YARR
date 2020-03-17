import React, { Component } from "react";
import { NavLink } from 'react-router-dom'

class StudyItem extends Component {
  render() {
    const { index } = this.props
    return (
      <div className="studyItem">
        <NavLink to={`/study/${index}`} className="linkHolder">
          {this.props.children}
        </NavLink>
      </div>
    )
  }
}

export default StudyItem;