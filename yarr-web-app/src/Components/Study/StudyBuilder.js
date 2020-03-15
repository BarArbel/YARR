import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MDBBtn } from 'mdbreact'
import PropTypes from 'prop-types'
import UserActions from '../../Actions/UserActions'
import StudyActions from '../../Actions/StudyActions'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
  }
}

class StudyBuilder extends Component {
  constructor(props) {
    super(props)

    this.state = {
      title: "",
      studyQuestions: "",
      description: "",
      isMsg: false,
      error: false,
      msg: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleSubmit(event) {
    const { title, studyQuestions, description } = this.state
    const { userInfo, handleToggleBuildStudy } = this.props

    const url = 'http://localhost:3002/addStudy'
    /* fetch request to add Study */
    const json = {
      researcherId: userInfo.researcherId,
      title: title,
      description: description,
      studyQuestions: studyQuestions
    }

    event.preventDefault()

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
      .then(json => {
        if (json.result === "Success") {
          this.setState({ msg: "success", isMsg: true, error: false })
          handleToggleBuildStudy()
        }
        else {
          this.setState({ msg: "failed", isMsg: true, error: true })
        }
      })
      .catch(err => {
        console.log(err)
        this.setState({ msg: "failed", isMsg: true, error: true })
      });
  }

  handleChange(event) {
    const { name, value } = event.target

    this.setState({ [name]: value });
  }

  render() {
    const { title, studyQuestions, description} = this.state
    const highCount = { color: "black" }
    const averageCount = { color: "#ffae42" }
    const lowCount = { color: "red" }
    const titleRemaining = 1024 - this.state.title.length
    const questionsRemaining = 4096 - this.state.studyQuestions.length
    const descriptionRemaining = 4096 - this.state.description.length

    const titleStyle = titleRemaining < 512 ? (titleRemaining < 128 ? lowCount : averageCount) : (highCount)
    const questionsStyle = questionsRemaining < 2048 ? (questionsRemaining < 128 ? lowCount : averageCount) : (highCount)
    const descriptionStyle = descriptionRemaining < 2048 ? (descriptionRemaining < 128 ? lowCount : averageCount) : (highCount)

    return (
      <div className="studyBuilder">
        <form onSubmit={this.handleSubmit}>
          <p className="h4 text-center mb-4">Create Study</p>
          <div className="form-group FormMargins">
            <label htmlFor="defaultFormStudyTitle" className="grey-text">
              Study Title
            </label>
            <input
              value={title}
              onChange={this.handleChange}
              id="defaultFormStudyTitle"
              className="form-control"
              maxLength="1024"
              name="title"
              required
            />
            <p style={titleStyle} className="input-limit">{titleRemaining}</p>
          </div>
          <div className="form-group FormMargins">
            <label htmlFor="defaultFormStudyDetails" className="grey-text">
              Study Description
            </label>
            <textarea
              value={description}
              onChange={this.handleChange}
              id="defaultFormStudyDetails"
              className="form-control"
              name="description"
              rows="5"
              maxLength="4096"
              required
            />
            <p style={descriptionStyle} className="input-limit">{descriptionRemaining}</p>
          </div>
          <div className="form-group FormMargins">
            <label htmlFor="defaultFormStudyQuestions" className="grey-text">
              Study Questions
            </label>
            <textarea
              value={studyQuestions}
              onChange={this.handleChange}
              id="defaultFormStudyQuestions"
              className="form-control"
              name="studyQuestions"
              maxLength="4096"
              rows="5"
              required
            />
            <p style={questionsStyle} className="input-limit">{questionsRemaining}</p>
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

export default connect(mapStateToProps, { ...UserActions, ...StudyActions })(StudyBuilder)
