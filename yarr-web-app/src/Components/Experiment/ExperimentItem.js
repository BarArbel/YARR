import PropTypes from "prop-types"
import { connect } from "react-redux"
import React, { Component } from "react"
import { Link } from 'react-router-dom'
import { MDBIcon } from 'mdbreact'
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
  }

  handleEdit() {

  }

  render() {
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
}

ExperimentItem.propTypes = {
  experimentId: PropTypes.number,
  studyId: PropTypes.number,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func
};

export default connect(mapStateToProps, { ...ExperimentActions })(ExperimentItem)
