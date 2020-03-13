import Header from './Header'
import SignIn from './SignIn'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import  { Redirect } from 'react-router-dom'
import UserActions from '../Actions/UserActions'

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
        mountFinish: false
    }

    this.verifyUser = this.verifyUser.bind(this)
  }

  componentDidMount(){
    const { isLogged, handleSetUser, handleSetBearerKey } = this.props

    /* If not in state, check if in local storage */
    if(!isLogged){
        /* If in local storage, add it to state */ 
        if(localStorage.getItem("isLogged")){
            const userInfo = JSON.parse(localStorage.getItem("userInfo"))
            const bearerKey = localStorage.getItem("bearerKey")
            handleSetUser(userInfo)
            handleSetBearerKey(bearerKey)
        }
    }

    this.setState({ mountFinish: true })
  }
  
  verifyUser(userName, password){
    const url = "http://localhost:3001/verifyResearcher"
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
            handleSetUser(json.userInfo)
            handleSetBearerKey(json.bearerKey)
          }
          else {
            console.log(json)
          }
        })
    .catch(err => console.log(err));
  }

  render() {
    const { isLogged } = this.props
    const { mountFinish } = this.state

    return mountFinish ? (isLogged ? (<Redirect to='/homePage'/>) : (
      <div className="loginHeader">
        <Header/>
        <SignIn verifyUser={this.verifyUser}/>
      </div>
    )) : null
  }
}

export default connect(mapStateToProps, {...UserActions})(Login);
