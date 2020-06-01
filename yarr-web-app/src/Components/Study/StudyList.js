import StudyItem from './StudyItem'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import StudyActions from '../../Actions/StudyActions'
import SnackbarActions from '../../Actions/SnackbarActions'

const mapStateToProps = ({ user, study }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey,
    studies: study.studies
  }
}

class StudyList extends Component {

  constructor(props){
    super(props)

    this.eachStudy = this.eachStudy.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  componentDidMount() {
    const { userInfo, handleAddStudies, bearerKey } = this.props
    const getAllUrl = `https://yarr-study-service.herokuapp.com/getAllResearcherStudies?researcherId=${userInfo.researcherId}`
    const json = {
      bearerKey: bearerKey,
      userInfo: userInfo
    }

    fetch(getAllUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    })
    .then(res => { 
      res.status === 200 && res.json().then(json => {
        if (json.result === "Success") {
          handleAddStudies(json.studies)
        }
        else {
          handleAddStudies([])
        }
    })
      })
      .catch(err => {
        handleAddStudies([])
      })
  }

  handleDelete(studyId) {
    const { handleDeleteStudy, bearerKey, userInfo, handleShowSnackbar } = this.props
    const url = `https://yarr-study-service.herokuapp.com/deleteStudy?studyId=${studyId}`
    const json = {
      bearerKey: bearerKey,
      userInfo: userInfo
    }

    fetch(url, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    }).then(res => { 
      if(res.status === 200){
        res.json().then(json => {
          if (json.result === "Success") {
            handleDeleteStudy(parseInt(studyId))
            handleShowSnackbar({ msg: `Study Successfully Deleted`, severity: "success" })
          }
          else handleShowSnackbar({ msg: `Failed To Delete Study`, severity: "error" })
        })
      }
      else handleShowSnackbar({ msg: `Failed To Delete Study`, severity: "error" })
    })
    .catch(err => handleShowSnackbar({ msg: `Failed To Delete Study`, severity: "error" }))
  }

  eachStudy(study, i) {
    const { Description, StudyQuestions, Title } = study
    const limitedQuestions = StudyQuestions.length > 265 ? StudyQuestions.substring(0, 265) + '...' : StudyQuestions
    const limitedDescription = Description.length > 265 ? Description.substring(0, 265) + '...' : Description
    const { toggleEdit } = this.props
    return (
      <StudyItem 
        key={`study${i}`} 
        studyId={study.StudyId} 
        onDelete={this.handleDelete}
        study={study}
        toggleEdit={toggleEdit}
      >
        <h5 className="card-title">{Title}</h5>
        <h6 className="card-title">Study Questions</h6>
        <p className="card-text">{limitedQuestions}</p>
        <h6 className="card-title">Description</h6>
        <p className="card-text">{limitedDescription}</p>
      </StudyItem>
    )
  }

  render() {
    const { studies } = this.props

    return(
      <div className="studyList">
        <h1 className="h4 text-center mb-4">My Studies</h1>
        {studies.map(this.eachStudy)}
      </div>
    )
  }
}

export default connect(mapStateToProps, { ...StudyActions, ...SnackbarActions })(StudyList);