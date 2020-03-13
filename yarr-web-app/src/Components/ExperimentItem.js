import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ExperimentsActions from "../Actions/ExperimentsActions"

const mapStateToProps = ({}) => {
  return {}
}

export class ExperimentItem extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { title, creationDate, status } = this.props
    return (
      <div className = "experimentItem">
        <label>{title}</label>
        <div>
          <label>{creationDate}</label>
          <label>{status}</label>
          <button>View</button>
          <button>Edit</button>
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
  gameSettings: PropTypes.string
};

export default connect(mapStateToProps, ...ExperimentsActions)(ExperimentItem)
