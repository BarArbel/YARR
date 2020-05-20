import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import MoonLoader from "react-spinners/MoonLoader"
import randomColor from 'randomcolor'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey
  }
}

class StudyInsightMirror extends Component {
  constructor(props){
    super(props)

    this.dataSets = []

    this.state = {
      currData: [],
      types: [],
      names: [],
      selectedType: 0,
      dataLoaded: false
    }

    this.setData = this.setData.bind(this)
    this.handleTypeChange = this.handleTypeChange.bind(this)
  }

  async componentDidMount() {
    const { studyId, userInfo, bearerKey } = this.props

    const url = `https://yarr-insight-service.herokuapp.com/requestInsightMirror?researcherId=${userInfo.researcherId}&studyId=${studyId}`
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
        if(json.result === "Success") {
          this.dataSets = json.dataSets

          this.setState({ selectedType: 0, types: json.types })
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
    const { types } = this.state
    let tempIndex

    this.dataSets.map((dataSet, i) => {
      tempIndex = dataSet[0].type === types[index] ? i : tempIndex
      return null
    })

    this.setState({ currData: this.dataSets[tempIndex], names: this.dataSets[tempIndex][0].names, dataLoaded: true })
  }

  render() {
    const { types, selectedType, currData, names, dataLoaded } = this.state
    const hues = ["green", "red", "blue", "yellow", "monochrome"]

    return (
      <div className="insightCard">
        <h4 style={{textAlign: "center"}}>Engagement Over Time</h4>
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
          {
            dataLoaded ? 
            (
              <div className="insightHolder">
                <LineChart
                  width={750}
                  height={450}
                  data={currData}
                  margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    height={50}
                    dataKey="time" 
                    type="category" 
                    label={{ value: 'Seconds', position: 'insideBottomRight', offset: 0 }} 
                  />
                  <YAxis 
                    type="number" 
                    label={{ value: 'Engagement', angle: -90, position: 'insideLeft', offset: 0 }} 
                  />
                  <Tooltip />
                  <Legend />
                  {names.map((name, i) => {
                    let randomcolor = randomColor({ hue: hues[i % 5], format: "hex", luminosity: "dark"})
                    return <Line key={`key${name}`} dataKey={name} stroke={randomcolor} />
                  })}
                </LineChart>
              </div>
            ) 
            : 
            (
              <div className="barLoader">
                <MoonLoader size={120} color={"#123abc"} loading={true} />
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyInsightMirror)