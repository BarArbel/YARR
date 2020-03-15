import React, { Component } from "react";

class StudyItem extends Component {
  render() {
    const { index, study } = this.props
    console.log(study)
    return (
      <div className="studyItem">
        <a className="linkHolder" href={`/study?id=${index}`}>
          {this.props.children}
        </a>
      </div>
    )
  }
}

export default StudyItem;