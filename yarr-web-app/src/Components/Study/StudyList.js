import { connect } from 'react-redux'
import React, { Component } from 'react'
import StudyItem from './StudyItem'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    bearerKey: user.bearerKey
  }
}

class StudyList extends Component {

  constructor(props){
    super(props)

    this.state = {
      studies: []
    }

    this.eachStudy = this.eachStudy.bind(this)
  }

  componentDidMount() {
    const { userInfo } = this.props

    const getAllUrl = `http://localhost:3001/getAllResearcherStudies?ResearcherId=${userInfo.researcherId}`;

    fetch(getAllUrl).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          console.log(json)
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
          <StudyItem key={`study${i}`} index={study.studyId}>
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
    return(
      <div className="studyList">
        <label>Your Studies</label>
        {this.state.studies.map(this.eachStudy)}
      </div>
    )
  }
}

export default connect(mapStateToProps)(StudyList);
