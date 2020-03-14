import { connect } from 'react-redux'
import React, { Component } from 'react'

const mapStateToProps = () => {

}

class StudyList extends Component {

  render() {
    return(
      <div className="studyList">
        <label>List</label>
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyList);
