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

const data = [
  { experiment: 'Math', A: 1, B: 110, fullMark: 10 },
  { subject: 'Chinese', A: 4, B: 130, fullMark: 10 },
  { subject: 'English', A: 10, B: 130, fullMark: 10 },
  { subject: 'Geography', A: 9, B: 100, fullMark: 10 },
  { subject: 'Physics', A: 8, B: 90, fullMark: 10 },
  { subject: 'History', A: 5, B: 85, fullMark: 10 },
]

class StudyInsightRadar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data: [],
      types: [],
      names: [],
      selectedType: 0
    }

    this.setData = this.setData.bind(this)
    this.handleTypeChange = this.handleTypeChange.bind(this)
  }

  componentDidMount() {
    const { studyId, userInfo } = this.props

    const url = `http://localhost:3004/requestInsightRadar?researcherId=${userInfo.researcherId}&studyId=${19}`

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
          // this.setData(0)
        }
      })
      .catch(err => console.log(err))
  }

  handleTypeChange(event) {
    this.setState({ selectedType: event.target.value })
    this.setData(event.target.value)
  }

  setData(index) {
    const data = this.data
    const { types } = this.state
    const filteredData = data.filter(element => { return element.BreakdownType === types[index] })
    const tempData = []
    const tempNames = []

    filteredData.map(element => {
      tempData.push({ time: parseInt(element.AxisTime), value: parseInt(element.AxisEngagement), BreakdownName: element.BreakdownName })
      !tempNames.find(name => name === element.BreakdownName) && tempNames.push(element.BreakdownName)
      return null
    })

    let dataSet = []

    for (let i = 3; dataSet.length < tempData.length / tempNames.length; i += 3) {
      let tempFiltered = tempData.filter(element => parseInt(element.time) === i)

      if (!tempFiltered || !tempFiltered.length) {
        continue
      }

      dataSet.push({
        name: `Time: ${tempFiltered[0].time}`,
        [tempFiltered[0].BreakdownName]: tempFiltered[0].value,
        [tempFiltered[1].BreakdownName]: tempFiltered[1].value
      })
    }

    this.setState({ currData: dataSet, names: tempNames })
  }

  render() {
    const { types, selectedType, currData, names } = this.state

    return (
      <div className="insightCard">
        {/* <div className="">
          <select
            value={selectedType}
            onChange={this.handleTypeChange}
            className="form-control selectType"
          >
            {types.map((type, index) => {
              return <option key={`option${type}`} value={index}>{type}</option>
            })}
          </select>
        </div> */}
        <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={500} data={currData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis domain={[0, 10]}/>
          <Radar dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyInsightRadar)