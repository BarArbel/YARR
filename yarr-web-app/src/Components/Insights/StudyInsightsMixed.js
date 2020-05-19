import { connect } from 'react-redux'
import React, { Component } from 'react'
import MoonLoader from "react-spinners/MoonLoader"
import ExperimentInsightsMixed from './ExperimentInsightsMixed'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey,
  }
}

class StudyInsightsMixed extends Component {
  constructor(props) {
    super(props)
    
    this.dataSets = []

    this.state = {
      names: [],
      currData: [],
      selectedType: 0,
      dataLoaded: false,
      experimentNames: []
    }

    this.setData = this.setData.bind(this)
    this.handleTypeChange = this.handleTypeChange.bind(this)
  }

  async componentDidMount() {
    const { studyId, userInfo, bearerKey } = this.props

    const url = `https://yarr-insight-service.herokuapp.com/requestAllInsightMixed?researcherId=${userInfo.researcherId}&studyId=${studyId}`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        console.log(json)
        if (json.result === "Success"){
          this.dataSets = json.dataSets
          this.setState({ dataSets: json.data, dataLoaded: true, experimentNames: json.experimentNames, names:json.names })
          this.setData(0)
        }
      })
      .catch(err => console.log(err))
  }

  handleTypeChange(event) {
    this.setState({ selectedType: event.target.value })
    this.setData(event.target.value)
  }

  setData(index) {
    const { experimentNames } = this.state
    let tempIndex

    this.dataSets.map((dataSet, i) => {
      tempIndex = dataSet[0].experimentTitle === experimentNames[index] ? i : tempIndex
      return null
    })

    this.setState({ currData: this.dataSets[tempIndex], names: this.dataSets[tempIndex][0].names, dataLoaded: true })
  }

  render() {
    const { selectedType, currData, names, experimentNames, dataLoaded } = this.state

    return (
      <div className="insightCard">
        <h4 style={{ textAlign: "center" }}>Player Performance</h4>
        <select
          value={selectedType}
          onChange={this.handleTypeChange}
          className="form-control selectType"
        >
          {experimentNames.map((type, index) => {
            return <option key={`option${type}`} value={index}>{type}</option>
          })}
        </select>
        {
          dataLoaded ?
            (
              <ExperimentInsightsMixed dataSet={currData} names={names}/>
            )
            :
            (
              <div className="barLoader">
                <MoonLoader size={120} color={"#123abc"} loading={true} />
              </div>
            )
        }
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyInsightsMixed)