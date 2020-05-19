import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  Radar,
  Tooltip,
  PolarGrid, 
  RadarChart, 
  PolarAngleAxis, 
  PolarRadiusAxis
} from 'recharts'
import MoonLoader from "react-spinners/MoonLoader"

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
          this.setState({ data: json.data })
        }
        else this.setState({ data: [] })
      })
      .catch(err => console.log(err))

    this.setState({ dataLoaded: true })
  }

  handleTypeChange(event) {
    this.setState({ selectedName: event.target.value })
  }

  render() {
    const { data, names, selectedName, dataLoaded } = this.state

    return (
      <div className="insightCard">
        <h4 style={{ textAlign: "center" }}>Most Engaging Game Mode</h4>
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
            <div className="insightHolder">
              <RadarChart cx={375} cy={230} outerRadius={175} width={1000} height={500} data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="experiment" />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar dataKey={names[selectedName]} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
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
    )
  }
}

export default connect(mapStateToProps)(StudyInsightRadar)