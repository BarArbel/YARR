import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ExperimentsActions from "../Actions/ExperimentsActions"
import ExperimentItem from "./ExperimentItem"

const mapStateToProps = ({ study }) => {
  return {
    experimentList: study.experimentList
  }
}

export class ExperimentList extends Component {
  constructor(props) {
    super(props)
    this.eachResult = this.eachResult.bind(this)
    this.renderList = this.renderList.bind(this)
    this.handleCreate = this.handleCreate(this)
  }

  handleCreate() {
    //move to create experiment form
  }

  handleEdit() {
    //move to edit page
  }

  handleDelete() {
    const url = `http://localhost:3001/deleteExperiment?${this.props.experimentId}`
    const { handleDeleteExperiment } = this.props

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

  eachResult(result) {
    const { studyId } = this.props
    return (
      <ExperimentItem
        experimentId={result.ExperimentId}
        studyId={studyId}
        title={result.Title}
        creationDate={result.CreationDate}
        status={result.Status}
        details={result.Details}
        gameSettings={result.GameSettings}
        handleEdit={this.handleEdit}
        handleDelete={this.handleDelete}
      />
    )
  }

  renderList() {
    const { results } = this.props
    if (results) {
      if (results["result"] == "Success") {
        return results["experiments"].map(this.eachResult)
      } else if (results["result"] == "Failure") {
        if (results["error"] == "No experiments found.") {
          return <label>There are no experiments related to this study.</label>
        }
      }
    }
    return <label>Something went wrong, please try again.</label>
  }

  render() {
    return (
      <div>
        <div>{this.renderList}</div>
        <button onClick={this.handleCreate}>Create Experiment</button>
      </div>
    )
  }
}

ExperimentList.propTypes = {
  studyId: PropTypes.number,
  results: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.object)
}

export default connect(mapStateToProps, ...ExperimentsActions)(ExperimentList)
