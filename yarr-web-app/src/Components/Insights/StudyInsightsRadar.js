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

    const url = `http://localhost:3004/requestInsightRadar?researcherId=${userInfo.researcherId}&studyId=${19}`

    fetch(url).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          let tempData = [{
            experiment: "test",
            highest: 1,
            mean: 10,
            median: 10,
            mode: 5,
            range: 9
          }]
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

    console.log(names[selectedName])
    return (
      <div className="card insightCard">
        <div className="card-body">
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
        <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={500} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="experiment" />
          <PolarRadiusAxis domain={[0, 10]}/>
          <Radar dataKey={names[selectedName]} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyInsightRadar)