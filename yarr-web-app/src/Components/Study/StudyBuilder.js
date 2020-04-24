import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MDBBtn } from 'mdbreact'
import PropTypes from 'prop-types'
import UserActions from '../../Actions/UserActions'
import StudyActions from '../../Actions/StudyActions'
import { withRouter } from "react-router";

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey
  }
}

class StudyBuilder extends Component {
  constructor(props) {
    super(props)

    this.state = {
      title: "",
      studyQuestions: "",
      description: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    const { editForm, currStudy } = this.props

    editForm && this.setState({ 
      title: currStudy.Title, 
      studyQuestions: currStudy.StudyQuestions, 
      description: currStudy.Description
    })
  }

  async handleSubmit(event) {
    const { title, studyQuestions, description } = this.state
    const { 
      userInfo, 
      handleToggleBuildStudy, 
      editForm, 
      currStudy, 
      onSubmit,
      handleUpdateStudy
    } = this.props
    let url = 'https://yarr-study-service.herokuapp.com'
    url += editForm ? '/updateStudy' : '/addStudy'
    /* fetch request to add Study */
    const json = {
      researcherId: userInfo.researcherId,
      title: title,
      description: description.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t"),
      studyQuestions: studyQuestions.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t"),
      studyId: editForm ? currStudy.StudyId : undefined
    }
    event.preventDefault()

    await fetch(url, {
      method: editForm ? 'PUT' : 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          if(editForm) {
            currStudy.Title = title
            currStudy.Description = description
            currStudy.StudyQuestions = studyQuestions
            onSubmit(currStudy)
            handleUpdateStudy(currStudy)
          }
          else {
            handleToggleBuildStudy()
            this.props.history.push(`/study/${json.params.insertId}`)
          }
        }
        else {
          // do something
        }
      })
      .catch(err => {
        console.log(err)
          // do something
      })
  }

  handleChange(event) {
    const { name, value } = event.target

    this.setState({ [name]: value })
  }

  render() {
    const { title, studyQuestions, description } = this.state
    const { editForm } = this.props
    const highCount = { color: "black" }
    const averageCount = { color: "#ffae42" }
    const lowCount = { color: "red" }
    const titleRemaining = 1024 - title.length
    const questionsRemaining = 4096 - studyQuestions.length
    const descriptionRemaining = 4096 - description.length
    const titleText = editForm ? "" : "Create Study"
    const titleStyle = titleRemaining < 512 ? (titleRemaining < 128 ? lowCount : averageCount) : (highCount)
    const questionsStyle = questionsRemaining < 2048 ? (questionsRemaining < 128 ? lowCount : averageCount) : (highCount)
    const descriptionStyle = descriptionRemaining < 2048 ? (descriptionRemaining < 128 ? lowCount : averageCount) : (highCount)

    return (
      <div className="studyBuilder">
        <form onSubmit={this.handleSubmit}>
          <p className="h4 text-center mb-4">{titleText}</p>
          <div className="form-group FormMargins">
            <label htmlFor="defaultFormStudyTitle" className="grey-text">
              Study Title
            </label>
            <input
              value={title}
              onChange={this.handleChange}
              id="defaultFormStudyTitle"
              className={!titleRemaining ? "zeroInputRemaining form-control" : "form-control"}
              maxLength="1024"
              name="title"
              required
            />
            {!titleRemaining ? <p style={titleStyle} className="input-limit">Choose a shorter title please</p> : null}
          </div>
          <div className="form-group FormMargins">
            <label htmlFor="defaultFormStudyQuestions" className="grey-text">
              Study Questions
            </label>
            <textarea
              value={studyQuestions}
              onChange={this.handleChange}
              id="defaultFormStudyQuestions"
              className={!questionsRemaining ? "zeroInputRemaining form-control" : "form-control"}
              name="studyQuestions"
              maxLength="4096"
              rows="5"
              required
            />
            <p style={questionsStyle} className="input-limit">{questionsRemaining}</p>
          </div>
          <div className="form-group FormMargins">
            <label htmlFor="defaultFormStudyDetails" className="grey-text">
              Study Description
            </label>
            <textarea
              value={description}
              onChange={this.handleChange}
              id="defaultFormStudyDetails"
              className={!descriptionRemaining ? "zeroInputRemaining form-control" : "form-control"}
              name="description"
              rows="5"
              maxLength="4096"
            />
            <p style={descriptionStyle} className="input-limit">{descriptionRemaining}</p>
          </div>
          <div className="text-center mt-4">
            <MDBBtn color="elegant" type="submit" className="login-btn">Save Study</MDBBtn>
          </div>
        </form>
      </div>
    )
  }
}

StudyBuilder.propTypes = {
  userInfo: PropTypes.object,
  isLogged: PropTypes.bool,
  bearerKey: PropTypes.string,
}

export default connect(mapStateToProps, { ...UserActions, ...StudyActions })(withRouter(StudyBuilder))
