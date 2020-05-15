import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ExperimentActions from "../../Actions/ExperimentActions"
import ExperimentItem from "./ExperimentItem"

const mapStateToProps = ({ experiment, user }) => {
  return {
    experimentList: experiment.experimentList,
    userInfo: user.userInfo,
    bearerKey: user.bearerKey
  }
}

export class ExperimentList extends Component {
  constructor(props) {
    super(props)

    this.renderList = this.renderList.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.eachExperiment = this.eachExperiment.bind(this)
  }

  componentDidMount() {
    const { studyId, handleSetExperiments, userInfo, bearerKey } = this.props

    const getAllUrl = `https://yarr-experiment-service.herokuapp.com/getAllStudyExperiments?studyId=${studyId}`

    const json = {
      bearerKey: bearerKey,
      userInfo: userInfo
    }

    fetch(getAllUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          handleSetExperiments(json.experiments)
        }
        else {
          handleSetExperiments([])
        }
      })
      .catch(err => handleSetExperiments([]))
  }

  handleDelete(experimentId) {
    const { handleDeleteExperiment, userInfo, bearerKey } = this.props
    const url = `https://yarr-experiment-service.herokuapp.com/deleteExperiment?experimentId=${experimentId}`

    const json = {
      bearerKey: bearerKey,
      userInfo: userInfo
    }

    fetch(url, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
        .then(json => {
          console.log(json)
          if (json.result === "Success") {
            handleDeleteExperiment(experimentId)
          }
        })
    .catch(err => console.log(err))
  }

  eachExperiment(experiment, i) {
    const { studyId, toggleEdit } = this.props
    const { Title, ExperimentId, CreationDate, Status, Details } = experiment
    const limitedDetails = Details.length > 265 ? Details.substring(0, 265) + '...' : Details
    const statusStyle = Status === "Running" ? 
    ({ color: "#4BB543", paddingLeft: 10 + 'px' }) 
      : (Status === "Ready" ? { paddingLeft: 10 + 'px' } : { color: "red", paddingLeft: 10 + 'px' })

    return (
      <div className="card" key={`container${i}`}>
        <div className="card-body">
          <ExperimentItem
            key={`experiment${i}`}
            experimentId={parseInt(ExperimentId)}
            onDelete={this.handleDelete}
            studyId={studyId}
            thisExperiment = {experiment}
            toggleEdit={toggleEdit}
          >
            <h4 className="card-title cardTitle">{Title}</h4>
            <p className="card-text">{limitedDetails}</p>
            <div className="cardInfoHolder">
              <label className="card-text cardInlineText">Creation Date:</label>
              <label className="card-title cardInlineText">{CreationDate}</label>
              <div className="cardInlineText">
                <label className="card-text">Status:</label>
                <label className="card-title" style={statusStyle}><b>{Status}</b></label>
              </div>
            </div>
          </ExperimentItem>
        </div>
      </div>
    )
  }

  renderList() {
    const { experimentList } = this.props
    if (experimentList.length)
      return experimentList.map(this.eachExperiment)
      
    return <label>No experiments found</label>
  }

  render() {
    return (
      <div className="experimentList">
        <h1 className="h4 text-center mb-4">Study Experiments</h1>
        {this.renderList()}
      </div>
    )
  }
}

ExperimentList.propTypes = {
  studyId: PropTypes.number,
  actions: PropTypes.objectOf(PropTypes.object)
}

export default connect(mapStateToProps, { ...ExperimentActions })(ExperimentList)
