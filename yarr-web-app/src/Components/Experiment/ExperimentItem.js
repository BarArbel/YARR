import PropTypes from "prop-types"
import { connect } from "react-redux"
import React, { Component } from "react"
import { NavLink } from 'react-router-dom'
import ExperimentActions from "../../Actions/ExperimentActions"

const mapStateToProps = ({ experiment }) => {
  return {
    experimentList: experiment.experimentList
  }
}

export class ExperimentItem extends Component {
  constructor(props) {
    super(props)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleEdit() {

  }

  handleDelete() {

  }


  render() {
    const { handleDelete, experimentId, studyId } = this.props
    return (
      <div className = "experimentItem">
        <NavLink to={`study/${studyId}/experiment/${experimentId}`} className="linkHolder">
        {this.props.children}
        {/* <label>{title}</label> */}
        </NavLink>
        <div>
          <button onClick={this.handleEdit}>Edit</button>
          <button onClick={this.handleDelete}>Delete</button>
        </div>
      </div>
    )
  }
}

ExperimentItem.propTypes = {
  experimentId: PropTypes.number,
  studyId: PropTypes.number,
  title: PropTypes.string,
  creationDate: PropTypes.string,
  status: PropTypes.string,
  details: PropTypes.string,
  gameSettings: PropTypes.string,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func
};

export default connect(mapStateToProps, { ...ExperimentActions })(ExperimentItem)
