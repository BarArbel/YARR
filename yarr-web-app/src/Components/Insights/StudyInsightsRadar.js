import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  Radar,
  RadarChart, 
  PolarGrid, 
  Legend,
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo
  }
}

class StudyInsightRadar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data: [],
      names: ["mean", "median", "mode", "range"],
      selectedName: 0
    }

    this.handleTypeChange = this.handleTypeChange.bind(this)
  }

  componentDidMount() {
    const { studyId, userInfo } = this.props

    const url = `https://yarr-insight-service.herokuapp.com/requestInsightRadar?researcherId=${userInfo.researcherId}&studyId=${studyId}`

    fetch(url).then(res => res.json())
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

          this.setState({ data: tempData })
        }
      })
      .catch(err => console.log(err))
  }

  handleTypeChange(event) {
    this.setState({ selectedName: event.target.value })
  }

  render() {
    const { data, names, selectedName } = this.state

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
        <RadarChart cx={300} cy={250} outerRadius={150} width={800} height={450} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="experiment" />
          <PolarRadiusAxis domain={[0, 10]}/>
          <Radar dataKey={names[selectedName]} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </div>
    ) : null
  }
}

export default connect(mapStateToProps)(StudyInsightRadar)