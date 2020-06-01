import Header from './Header'
import SignIn from './SignIn'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import  { Redirect } from 'react-router-dom'
import UserActions from '../Actions/UserActions'
import SnackbarActions from '../Actions/SnackbarActions'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
    verifyFinished: user.verifyFinished
  }
}

class Login extends Component {
  constructor(props){
    super(props)
    this.verifyUser = this.verifyUser.bind(this)
  }

  async verifyUser(userName, password){
    const url = 'https://yarr-user-management.herokuapp.com/verifyResearcher'
    const { 
      handleSetBearerKey, 
      handleSetUser, 
      handleSetVerifyFinished, 
      handleShowSnackbar 
    } = this.props
    
    let json = {
      userName: userName,
      password: password,
    }

    handleSetVerifyFinished(false)

    await fetch(url, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(json)
    }).then(res => { 
      if(res.status === 200) {
        res.json().then(json => {
            handleSetVerifyFinished(true)
            if(json.result === "Verified"){
              // this.setState({ , isMsg: true, error: false })
              handleShowSnackbar({msg: "Logged in successfully! Redirecting...", severity: "success"})
              setTimeout(() => {
                handleSetBearerKey(json.bearerKey)
                handleSetUser(json.userInfo)
              }, 3000);
            }
            else {
              handleShowSnackbar({ msg: "Logged Failed. Please try again.", severity: "error" })
            }
        })
      }
      else {
        handleSetVerifyFinished(true)
        handleShowSnackbar({ msg: "Logged Failed. Please try again.", severity: "error" })

      }
    })
    .catch(err => {
      handleShowSnackbar({ msg: "Logged Failed. Please try again.", severity: "error" })
      handleSetVerifyFinished(true)
    })
  }

  render() {
    const { isLogged } = this.props
    return isLogged ? (<Redirect to='/homePage'/>) : (
      <div className="loginHeader">
        <Header/>
        <SignIn verifyUser={this.verifyUser}/>
      </div>
    )
  }
}

export default connect(mapStateToProps, { ...UserActions, ...SnackbarActions})(Login)
