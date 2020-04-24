import Header from './Header'
import SignIn from './SignIn'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import  { Redirect } from 'react-router-dom'
import UserActions from '../Actions/UserActions'
import CustomSnackbar from './CustomSnackbar'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey
  }
}

class Login extends Component {
  constructor(props){
    super(props)

    this.state = {
      isMsg: false,
      error: false,
      msg: ""
    }

    this.verifyUser = this.verifyUser.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose(event, reason) {
    if (reason === 'clickaway') {
      return
    }
    this.setState({ isMsg: false })
  }
  
  verifyUser(userName, password){
    const url = 'https://yarr-user-management.herokuapp.com/verifyResearcher'
    const { handleSetBearerKey, handleSetUser } = this.props
    let json = {
      userName: userName,
      password: password,
    }

    fetch(url, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(json)
    }).then(res => res.json())
        .then(json => {
          if(json.result === "Verified"){
            this.setState({ msg: "Logged in successfully! Redirecting...", isMsg: true, error: false })
            setTimeout(() => {
              handleSetUser(json.userInfo)
              handleSetBearerKey(json.bearerKey)
            }, 3000);
          }
          else {
            this.setState({ msg: "Logged Failed. Please try again.", isMsg: true, error: true })
          }
        })
      .catch(err => this.setState({ msg: "Logged Failed. Please try again.", isMsg: true, error: true }))
  }

  render() {
    const { isLogged } = this.props
    const { msg, isMsg, error } = this.state
    return isLogged ? (<Redirect to='/homePage'/>) : (
      <div className="loginHeader">
        <Header/>
        <SignIn verifyUser={this.verifyUser}/>
        <CustomSnackbar
          open={isMsg}
          onClose={this.handleClose}
          msg={msg}
          severity={error ? "error" : "success"}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps, {...UserActions})(Login)
