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

const data = [
  {
    name: 'Time: 9', Comp: 3, Coop: 1
  },
  {
    name: 'Time: 12', Comp: 3, Coop: 1
  },
  {
    name: 'Time: 15', Comp: 3, Coop: 1
  },
  {
    name: 'Time: 18', Comp: 5, Coop: 2
  },
  {
    name: 'Time: 21', Comp: 5, Coop: 3
  },
  {
    name: 'Time: 24', Comp: 3, Coop: 4
  }
]

class Example extends Component {
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

    const url = `http://localhost:3004/requestInsightMirror?researcherId=${userInfo.researcherId}&studyId=${19}`

    fetch(url).then(res => res.json())
      .then(json => {
        if(json.result === "Success") {
          this.data = json.data
          let tempTypes = []
          json.data.map(line => {
            !tempTypes.find(element => element === line.BreakdownType) && tempTypes.push(line.BreakdownType)
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
    const filteredData = data.filter(element => element.BreakdownType === types[index])
    const tempData = []
    const tempNames = []

    filteredData.map(element => {
      tempData.push({ time: parseInt(element.AxisTime), value: parseInt(element.AxisEngagement), BreakdownName: element.BreakdownName})
      !tempNames.find(name => name === element.BreakdownName) && tempNames.push(element.BreakdownName)
    })
    
    let dataSet = []

    for(let i = 3; dataSet.length < tempData.length / 2; i += 3){
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
      <div>
        <select
          value={selectedType}
          onChange={this.handleTypeChange}
        >
          {types.map((type, index) => {
            return <option key={`option${type}`} value={index}>{type}</option>
          })}
        </select>

        <LineChart
          layout="vertical"
          width={500}
          height={300}
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
          {/* <Line dataKey={names[0]} stroke="#8884d8" />
          <Line dataKey={names[1]} stroke="#82ca9d" /> */}
        </LineChart>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Example)