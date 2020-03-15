import React, { Component } from "react";
import { Redirect } from 'react-router-dom'

class StudyItem extends Component {
  constructor(props){
    super(props)

    this.state = {
      clicked: false
    }

    this.handleClicked = this.handleClicked.bind(this)
  }
  
  handleClicked(event){
    event.preventDefault()
    this.setState({ clicked: true })
  }

  render() {
    const { index } = this.props
    const { clicked } = this.state

    return clicked ? (< Redirect to={`/study/${index}`} />) : (
      <div className="studyItem">
        <a href="/" className="linkHolder" onClick={this.handleClicked}>
          {this.props.children}
        </a>
      </div>
    )
  }
}

export default StudyItem;