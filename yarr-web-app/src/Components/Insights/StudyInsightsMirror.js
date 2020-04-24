import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo
  }
}

class StudyInsightMirror extends Component {
  constructor(props){
    super(props)

    this.data = []

    this.state = {
      currData: [],
      types: [],
      names: [],
      selectedType: 0
    }

    this.setData = this.setData.bind(this)
    this.handleTypeChange = this.handleTypeChange.bind(this)
  }

  componentDidMount() {
    const { studyId, userInfo } = this.props

    const url = `https://yarr-insight-service.herokuapp.com/requestInsightMirror?researcherId=${userInfo.researcherId}&studyId=${studyId}`

    fetch(url).then(res => res.json())
      .then(json => {
        if(json.result === "Success") {
          this.data = json.data
          let tempTypes = []
          json.data.map(line => {
            !tempTypes.find(element => { return element === line.BreakdownType}) && tempTypes.push(line.BreakdownType)
            return null
          })
          this.setState({ selectedType: 0, types: tempTypes })
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
    const data = this.data
    const { types } = this.state
    const filteredData = data.filter(element => {return element.BreakdownType === types[index]})
    const tempData = []
    const tempNames = []

    filteredData.map(element => {
      tempData.push({ time: parseInt(element.AxisTime), value: parseInt(element.AxisEngagement), BreakdownName: element.BreakdownName})
      !tempNames.find(name => name === element.BreakdownName) && tempNames.push(element.BreakdownName)
      return null
    })

    let dataSet = []

    for (let i = 3; dataSet.length < tempData.length / tempNames.length; i += 3){
      let tempFiltered = tempData.filter(element => parseInt(element.time) === i)

      if(!tempFiltered || !tempFiltered.length){
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
        <div>
          <select
            value={selectedType}
            onChange={this.handleTypeChange}
            className="form-control selectType"
          >
            {types.map((type, index) => {
              return <option key={`option${type}`} value={index}>{type}</option>
            })}
          </select>

          <LineChart
            layout="vertical"
            width={500}
            height={350}
            data={currData}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            {names.map(name => {
              let randomcolor =  '#' + Math.random().toString(16).substr(-6);
              return <Line key={`key${name}`} dataKey={name} stroke={randomcolor} />
            })}
          </LineChart>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyInsightMirror)