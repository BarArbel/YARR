import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ExperimentActions from "../../Actions/ExperimentActions"

const mapStateToProps = ({ experiment }) => {
  return {
    experimentList: experiment.experimentList
  }
}

export class ExperimentItem extends Component {
  constructor(props) {
    super(props)
    this.handleView = this.handleView.bind(this)
  }

  handleView() {}

  render() {
    const { title, creationDate, status, handleEdit, handleDelete } = this.props
    return (
      <div className = "experimentItem">
        <label>{title}</label>
        <div>
          <label>{creationDate}</label>
          <label>{status}</label>
          <button onClick={this.handleView}>View</button>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
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
