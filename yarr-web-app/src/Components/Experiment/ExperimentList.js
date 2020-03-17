import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ExperimentActions from "../../Actions/ExperimentActions"
import ExperimentItem from "./ExperimentItem"

const mapStateToProps = ({ experiment }) => {
  return {
    experimentList: experiment.experimentList
  }
}

export class ExperimentList extends Component {
  constructor(props) {
    super(props)

    this.renderList = this.renderList.bind(this)
    this.eachExperiment = this.eachExperiment.bind(this)
    this.handlehandleDelete = this.handleDelete.bind(this)
  }

  handleEdit() {
    //move to edit page
  }

  handleDelete() {
    const { handleDeleteExperiment, experimentId } = this.props
    const url = `http://localhost:3001/deleteExperiment?${experimentId}`

    fetch(url, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }).then(res => res.json())
        .then(json => {
          console.log(json)
          if (json.result === "Success") {
            handleDeleteExperiment(this.props.experimentId)
          }
        })
    .catch(err => console.log(err))
  }

  eachExperiment(experiment, i) {
    const { studyId } = this.props
    
    return (
      <ExperimentItem
        key={`experiment${i}`}
        experimentId={parseInt(experiment.ExperimentId)}
        studyId={parseInt(studyId)}
        title={experiment.Title}
        creationDate={experiment.CreationDate}
        status={experiment.Status}
        details={experiment.Details}
        gameSettings={experiment.GameSettings}
        handleEdit={this.handleEdit}
        handleDelete={this.handleDelete}
      />
    )
  }

  renderList() {
    const { experimentList } = this.props
    if (experimentList.length) {
      return experimentList.map(this.eachExperiment)
    }
    return <label>Something went wrong, please try again.</label>
  }

  render() {
    return (
      <div>
        <div>{this.renderList()}</div>
      </div>
    )
  }
}

ExperimentList.propTypes = {
  studyId: PropTypes.number,
  results: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.object)
}

export default connect(mapStateToProps, { ...ExperimentActions })(ExperimentList)
