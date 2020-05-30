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
  _isMounted = false
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
    this.renderWait = this.renderWait.bind(this)
    this.renderData = this.renderData.bind(this)
    this.handleTypeChange = this.handleTypeChange.bind(this)
  }

  async componentDidMount() {
    this._isMounted = true
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
    }).then(res => { 
      if(res.status === 200){
        res.json().then(json => {
          if (json.result === "Success") {
            this.dataSets = json.dataSets
            this._isMounted && this.setState({ dataSets: json.data, dataLoaded: true, experimentNames: json.experimentNames, names:json.names })
            this.setData(0)
          }
          else {
            this.dataSets = []
            this._isMounted && this.setState({ dataSets: [], dataLoaded: true, experimentNames: [], names: [] })
          }
        })
      }
      else {
        this.dataSets = []
        this._isMounted && this.setState({ dataSets: [], dataLoaded: true, experimentNames: [], names: [] })
      }
    })
    .catch(err => {
      this.dataSets = []
      this._isMounted && this.setState({ dataSets: [], dataLoaded: true, experimentNames: [], names: [] })
    })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  handleTypeChange(event) {
    this._isMounted && this.setState({ selectedType: event.target.value })
    this.setData(event.target.value)
  }

  setData(index) {
    const { experimentNames } = this.state
    let tempIndex
    this.dataSets.map((dataSet, i) => {
      tempIndex = dataSet[0].experimentTitle === experimentNames[index] ? i : tempIndex
      return null
    })

    console.log(this.dataSets[tempIndex])
    this._isMounted && this.setState({ currData: this.dataSets[tempIndex] })
  }

  renderWait() {
    return (
      <div className="barLoader">
        <MoonLoader size={120} color={"#123abc"} loading={true} />
      </div>
    )
  }

  renderData() {
    const { selectedType, currData, names, experimentNames } = this.state

    return (
      <div>
        {
          experimentNames.length !== 0 && 
          <select
            value={selectedType}
            onChange={this.handleTypeChange}
            className="form-control selectType"
          >
            {experimentNames.map((type, index) => {
              return <option key={`option${type}`} value={index}>{type}</option>
            })}
          </select>
        }
        {
        currData.length ? 
          <ExperimentInsightsMixed dataSet={currData} names={names} />
        :
          <p style={{ textAlign: "center", paddingTop: "25px" }}>No data collected</p>
        }
      </div>
    )
  }

  render() {
    const { dataLoaded } = this.state

    return (
      <div className="insightCard">
        <h4 style={{ textAlign: "center" }}>Response to Difficulty Changes</h4>
        {
          dataLoaded ? this.renderData()  : this.renderWait()
        }
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyInsightsMixed)