import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Line,
  Area,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ComposedChart,
  CartesianGrid
} from 'recharts'
import MoonLoader from "react-spinners/MoonLoader"

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey,
  }
}

class ExperimentInsightsMixed extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data: [],
      names: [],
      dataLoaded: false
    }

  }

  async componentDidMount() {
    const { userInfo, bearerKey, experimentId, dataSet, names } = this.props

    /* dataSet is provided via props */
    if(!experimentId && dataSet && names) {
      this.setState({ data: dataSet, dataLoaded: true, names: names })
      return
    }

    const url = `https://yarr-insight-service.herokuapp.com/requestInsightMixed?researcherId=${userInfo.researcherId}&experimentId=${experimentId}`
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
        if (json.result === "Success")
          this.setState({ data: json.data, names: json.names, dataLoaded: true })
      })
      .catch(err => console.log(err))
  }

  render() {
    const { dataSet } = this.props
    const { data, names, dataLoaded } = this.state

    return (
      <div className="insightCard">
        <h4 style={{ textAlign: "center" }}>Player Performance</h4>
        {
          dataLoaded ?
            (
              <div className="insightHolder">
                <ComposedChart
                  width={750}
                  height={450}
                  data={dataSet ? dataSet : data}
                  margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                  }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="time" height={50} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area dataKey={names[0]} fill="#8884d8" stroke="#8884d8" />
                  <Line type="monotone" dataKey={names[1]} stroke="#ff7300" />
                </ComposedChart>
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

export default connect(mapStateToProps)(ExperimentInsightsMixed)