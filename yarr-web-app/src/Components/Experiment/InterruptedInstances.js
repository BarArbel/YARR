import { MDBIcon } from 'mdbreact'
import React, { Component } from 'react'
import Skeleton from 'react-loading-skeleton'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import DeleteConfirmation from '../Utilities/DeleteConfirmation'

export class InterruptedInstances extends Component {
  constructor(props) {
    super(props)

    this.state = {
      instances: [],
      dataLoaded: false
    }
    this.renderWait = this.renderWait.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.deleteInstance = this.deleteInstance.bind(this)
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
        // console.clear();
        this.setState({ instances: [], dataLoaded: true })
      }
    })
      .catch(err => {
        // console.clear();
        this.setState({ instances: [], dataLoaded: true })
      })
  }

  deleteInstance(instanceId) {
    const { instances } = this.state
    const { userInfo, bearerKey } = this.props
    const url = `https://yarr-experiment-service.herokuapp.com/deleteInterruptedInstance?instanceId=${instanceId}`
    const json = {
      userInfo: userInfo,
      bearerKey: bearerKey
    }

    fetch(url, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    }).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        const newList = instances.filter(i => i.InstanceId !== instanceId)
        this.setState({ instances: newList })
      }
      else {
      }
    })
      .catch(err => {
      })
  }

  handleDelete(instanceId) {
    const deleteInstance = this.deleteInstance
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <DeleteConfirmation
            onClose={onClose}
            onDelete={deleteInstance}
            objectId={instanceId}
            objectType="interrupted instance"
            subType="data"
            objectTitle={instanceId}
          />
        )
      }
    })

  }

  renderWait() {
    return(
      <div style={{ marginTop: "25px" }} >
        <Skeleton count={1} />
        <Skeleton count={1} />
        <Skeleton count={1} />
      </div>
    )
  }

  renderInstance(instance, index) {
    const time = instance.InstanceId.split("_")[0]
    const day = new Date(parseInt(time))
    const stringDate = `${day.getDate() < 10 ? `0${day.getDate()}` : day.getDate()}` +
      `/${day.getMonth() < 10 ? `0${day.getMonth() + 1}` : day.getMonth() + 1}` +
      `/${day.getFullYear()} At ${day.getHours() < 10 ? `0${day.getHours()}` : day.getHours()}` + 
      `:${day.getMinutes() < 10 ? `0${day.getMinutes()}` : day.getMinutes()}`

    return (
      <div key={`instance${index}`} className="card">
        <div className="card-body">
          <button onClick={()=> {this.handleDelete(instance.InstanceId)}} className="invisButton"><MDBIcon className="trashIcon" icon="trash" /></button>
          <label className="card-text cardInlineText">Created On: </label>
          <label className="card-title cardInlineText">{stringDate}</label>
          <label className="card-text cardInlineText">Game Code: </label>
          <label className="card-title cardInlineText">{instance.GameCode}</label>
        </div>
      </div>
    )
  }

  render() {
    const { dataLoaded, instances } = this.state

    return (
      <div className="interruptedInstances">
        {
          instances.length !== 0 ? 
          (
            <div>
              <hr style={{marginBottom: '25px'}}/>
              <h4 className="centerText">Unfinished Games</h4>
            </div>
          ) 
          : 
          null
        }
        
        {dataLoaded ? 
          (instances.length ? instances.map((instance, index) => { return this.renderInstance(instance, index) }) : null)
          :
          this.renderWait()
        }
      </div>
    )
  }
}


export default InterruptedInstances
