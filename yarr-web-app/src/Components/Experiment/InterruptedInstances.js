import React, { Component } from 'react'

export class InterruptedInstances extends Component {
  constructor(props) {
    super(props)

    this.state = {
      instances: [],
      dataLoaded: false
    }

    this.renderInstance = this.renderInstance.bind(this)
  }

  componentDidMount() {
    const { experimentId, userInfo, bearerKey, notifyInterrupted } = this.props
    const url = `https://yarr-experiment-service.herokuapp.com/getInterruptedInstances?experimentId=${experimentId}`
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
    }).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        json.data.length && notifyInterrupted()
        this.setState({ instances: json.data , dataLoaded: true })
      }
      else {
        this.setState({ instances: [], dataLoaded: true })
      }
    })
      .catch(err => {
        this.setState({ instances: [], dataLoaded: true })
      })
  }

  renderInstance(instance, index) {
    const time = instance.InstanceId.split("_")[0]
    const day = new Date(parseInt(time))
    const stringDate = `${day.getDate() < 10 ? `0${day.getDate()}` : day.getDate()}` +
      `/${day.getMonth() < 10 ? `0${day.getMonth() + 1}` : day.getMonth() + 1}` +
      `/${day.getFullYear()} At ${day.getHours() < 10 ? `` : day.getHours()}` + 
      `:${day.getMinutes() < 10 ? `0${day.getMinutes()}` : day.getMinutes()}`

    return (
      <div key={`instance${index}`} className="card">
        <div className="card-body">
          <label className="card-title">Created On: </label>
          <label>{stringDate}</label>
          <label className="card-title">Game Code: </label>
          <label>{instance.GameCode}</label>
        </div>
      </div>
    )
  }

  render() {
    const { dataLoaded, instances } = this.state

    return (
      <div className="interruptedInstances">
        {dataLoaded && instances.length ? instances.map((instance, index) => { return this.renderInstance(instance, index) }) : null}
      </div>
    )
  }
}


export default InterruptedInstances
