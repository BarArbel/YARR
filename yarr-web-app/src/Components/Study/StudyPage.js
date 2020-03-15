import Header from '../Header'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserActions from '../../Actions/UserActions'
import StudyActions from '../../Actions/StudyActions'
import ExperimentList from '../Experiment/ExperimentList'
import ExperimentActions from '../../Actions/ExperimentActions'

const mapStateToProps = ({ user, study }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    studies: study.studies
  }
}

class StudyPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mountFinish: false
    }
  }

  async componentDidMount() {
    const { handleSetExperiments } = this.props
    const index = this.props.match.params.id
    console.log(this.props)
    const url = `http://localhost:3003/getAllStudyExperiments?studyId=${index}`

    await fetch(url).then(res => res.json()).then(json => {
      if (json.result === "Success") {
        console.log(json.experiments)
        handleSetExperiments(json.experiments)
        this.setState({ mountFinish: true })
      }
      else {
        console.log(json)
            this.setState({ mountFinish: true })
      }
    })
      .catch(err => console.log(err));
  }

  render() {
    const { userInfo, isLogged } = this.props
    const { mountFinish } = this.state
    const id = this.props.match.params.id
    console.log(userInfo)
    return mountFinish ? (isLogged ?(
      <div className="studyPage">
        <Header />
        <div className="container">
          {/* <ExperimentList/> */}
        </div>
      </div>
    ) : (<Redirect to='/homePage'/>)) : (null)
  }
}

export default connect(mapStateToProps, { ...UserActions, ...StudyActions, ...ExperimentActions })(StudyPage)
