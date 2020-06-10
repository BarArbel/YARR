import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid
} from 'recharts'
import MoonLoader from "react-spinners/MoonLoader"

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey,
  }
}

class InsightsBars extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data: [],
      dataLoaded: false
    }

    this.renderWait = this.renderWait.bind(this)
    this.renderData = this.renderData.bind(this)
  }

  componentDidMount() {
    const { userInfo, bearerKey, url } = this.props

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
          if (json.result === "Success")
            this.setState({ data: json.data, dataLoaded: true })
          else this.setState({ data: [], dataLoaded: true })
        })
      }
      else this.setState({ data: [], dataLoaded: true })
    })
    .catch(err => {
      this.setState({ data: [], dataLoaded: true })
    })
  }

  renderWait() {
    return (
      <div className="barLoader">
        <MoonLoader size={120} color={"#123abc"} loading={true} />
      </div>
    )
  }

  renderData() {
    const { data } = this.state

    return (
      data.length ? 
      (
        <div>
          <BarChart width={1000} height={500} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" height={50} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar stackId="a" dataKey="Captured" fill="#89cff0" />
            <Bar stackId="a" dataKey="Missed" fill="#FF9494" />
            <Bar stackId="b" dataKey="Hit" fill="#ffae42" />
            <Bar stackId="b" dataKey="Avoid" fill="#82ca9d" />
            <Bar stackId="b" dataKey="Blocked" fill="#b19cd9" />
          </BarChart>
        </div>
      ) 
      : 
      (
        <p style={{ textAlign: "center", paddingTop: "25px" }}>No data collected</p>
      )
    )
  }

  render() {
    const { dataLoaded } = this.state

    return (
      <div className="insightCard">
        <h4 style={{ textAlign: "center" }}>Player Performance</h4>
        {
          dataLoaded ? this.renderData() : this.renderWait()
        }
      </div>
    )
  }
}

export default connect(mapStateToProps)(InsightsBars)