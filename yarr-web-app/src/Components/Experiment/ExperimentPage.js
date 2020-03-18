import Header from '../Header'
import { MDBBtn } from 'mdbreact'
import { connect } from 'react-redux'
import Breadcrumbs from '../Breadcrumbs'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserActions from '../../Actions/UserActions'
import ExperimentActions from '../../Actions/ExperimentActions'
import BreadcrumbsActions from '../../Actions/BreadcrumbsActions'

const mapStateToProps = ({ user, experiment }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    experimentList: experiment.experimentList,
    experiment: experiment.experiment
  }
}

class ExperimentPage extends Component {
  constructor(props) {
    super(props)

    this.renderLogged = this.renderLogged.bind(this)
  }

  async componentDidMount() {
    const { handleSetRoutes } = this.props
    const experimentId = this.props.match.params.experimentId
    const studyId = this.props.match.params.studyId
    const routes = [
      { name: 'Home', redirect: '/homePage', isActive: true },
      { name: 'Study', redirect: `/Study/${studyId}`, isActive: true },
      { name: 'Experiment', redirect: `/Study/${studyId}/Experiment/${experimentId}`, isActive: false }
    ]
    
    handleSetRoutes(routes)
  }

  renderLogged(){
    const { userInfo, experiment } = this.props
    const {
      CreationDate,
      Status,
      Title,
      Details,
      CharacterType,
      ColorSettings,
      RoundsNumber,
      Rounds
    } = experiment
    console.log(experiment)

    return (
      <div className="studyPage">
        <Header />
        <Breadcrumbs/>
        <div className="container">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="profile-tab" data-toggle="tab" href="#gameSettings" role="tab" aria-controls="profile" aria-selected="false">Game Settings</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#insights" role="tab" aria-controls="contact" aria-selected="false">Insights</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#review" role="tab" aria-controls="contact" aria-selected="false">Review & Export</a>
            </li>
          </ul>

          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
              
            </div>
            <div className="tab-pane fade" id="gameSettings" role="tabpanel" aria-labelledby="profile-tab">
              <p>{CreationDate}</p>
              <p>{Status}</p>
              <p>{Title}</p>
              <p>{Details}</p>
              <p>{CharacterType}</p>
              <p>{ColorSettings}</p>
              <p>{RoundsNumber}</p>
              {/*<p>{Rounds}</p>*/}
            </div>
            <div className="tab-pane fade" id="insights" role="tabpanel" aria-labelledby="contact-tab">Placeholder 3</div>
            <div className="tab-pane fade" id="review" role="tabpanel" aria-labelledby="contact-tab">Placeholder 4</div>
          </div>
        </div>
      </div>
    )
  } 

  render() {
    const { isLogged } = this.props

    return isLogged ? (this.renderLogged()) : (<Redirect to='/' />)
  }
}

export default connect(mapStateToProps, { ...UserActions, ...ExperimentActions, ...BreadcrumbsActions })(ExperimentPage);
