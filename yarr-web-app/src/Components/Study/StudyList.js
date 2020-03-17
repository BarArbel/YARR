import StudyItem from './StudyItem'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import StudyActions from '../../Actions/StudyActions'

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
  }

  componentDidMount() {
    const { userInfo, handleAddStudies } = this.props

    const getAllUrl = `http://localhost:3002/getAllResearcherStudies?researcherId=${userInfo.researcherId}`;

    fetch(getAllUrl).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          handleAddStudies(json.studies)
          this.setState({studies: json.studies})
        }
        else {
        }
      })
      .catch(err => console.log(err));
  }

  eachStudy(study, i) {
    return (
      <div className="card" key={`container${i}`}>
        <div className="card-body">
          <StudyItem key={`study${i}`} studyId={study.StudyId}>
            <h5 className="card-title">{study.Title}</h5>
            <h6 className="card-title">Study Questions</h6>
            <p className="card-text">{study.StudyQuestions}</p>
            <h6 className="card-title">Description</h6>
            <p className="card-text">{study.Description}</p>
          </StudyItem>
        </div>
      </div>
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

export default connect(mapStateToProps, { ...StudyActions})(StudyList);
