import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  Radar,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts'
import BarLoader from "react-spinners/BarLoader"

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey,
  }
}

class StudyInsightRadar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data: [],
      names: ["mean", "median", "mode", "range"],
      selectedName: 0,
      dataLoaded: false
    }

    this.handleTypeChange = this.handleTypeChange.bind(this)
  }

  async componentDidMount() {
    const { studyId, userInfo, bearerKey } = this.props

    const url = `https://yarr-insight-service.herokuapp.com/requestInsightRadar?researcherId=${userInfo.researcherId}&studyId=${studyId}`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          let tempData = []
          json.data.map(line => {
            tempData.push({ 
              experiment: line.ExperimentTitle,
              highest: parseInt(line.HighestEngagement),
              mean: parseInt(line.MeanEngagement),
              median: parseInt(line.MedianEngagement),
              mode: parseInt(line.ModeEngagement),
              range: parseInt(line.RangeEngagement)
            })
            return null
          })

          this.setState({ data: tempData, dataLoaded: true })
        }
      })
      .catch(err => console.log(err))
  }

  handleTypeChange(event) {
    this.setState({ selectedName: event.target.value })
  }

  render() {
    const { data, names, selectedName, dataLoaded } = this.state

    return data.length ? (
      <div className="insightCard">
        <div>
          <select
            value={selectedName}
            onChange={this.handleTypeChange}
            className="form-control selectType"
          >
            {names.map((name, index) => {
              return <option key={`option${name}`} value={index}>{name}</option>
            })}
          </select>
        </div>
        {
          dataLoaded ? 
          (
            <RadarChart cx={300} cy={250} outerRadius={150} width={800} height={450} data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="experiment" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar dataKey={names[selectedName]} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          ) 
          : 
          (
            <BarLoader size = { 45 } color = { "#123abc" } loading = { true } />
          )
        }
      </div>
    ) : null

  }
}

export default connect(mapStateToProps)(StudyInsightRadar)