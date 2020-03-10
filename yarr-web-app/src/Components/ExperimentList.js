import React, { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import PropTypes from "prop-types"
import actions from "../Actions/ExperimentsActions"
import ConnectedExperimentItem from "./ExperimentItem"

const mapStateToProps = ({}) => {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {}
  }
}

export class ExperimentList extends Component {
  constructor(props) {
    super(props)
    this.eachResult = this.eachResult.bind(this)
    this.renderList = this.renderList.bind(this)
  }

  eachResult(result) {
    const { studyId } = this.props
    return (
      <ConnectedExperimentItem
        experimentId={result.ExperimentId}
        studyId={studyId}
        title={result.Title}
        creationDate={result.CreationDate}
        status={result.Status}
        details={result.Details}
        gameSettings={result.GameSettings}
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
          return <Text>There are no experiments related to this study.</Text>
        }
      }
    }
    return <Text>Something went wrong, please try again.</Text>
  }

  render() {
    return (
      <Div>
        <Div>{this.renderList}</Div>
      </Div>
    )
  }
}

ExperimentList.propTypes = {
  studyId: PropTypes.number,
  results: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.object)
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentList)
