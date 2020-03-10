import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import actions from "../Actions/ExperimentsActions"

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
      <Div>
        <Text>{title}</Text>
        <Div>
          <Text>{creationDate}</Text>
          <Text>{status}</Text>
          <Button>View</Button>
          <Button>Edit</Button>
        </Div>
      </Div>
    );
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

export default connect(mapStateToProps, actions)(ExperimentItem)
