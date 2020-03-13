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

    this.verifyUserTest = this.verifyUserTest.bind(this)
  }

  componentDidMount(){
    const { isLogged, handleSetUser, handleSetBearerKey } = this.props

    /* If not in state, check if in local storage */
    if(!isLogged){
        /* If in local storage, add it to state */ 
        if(localStorage.getItem("isLogged")){
            const userInfo = JSON.parse(localStorage.getItem("userInfo"))
            const bearerKey = JSON.parse(localStorage.getItem("bearerKey"))
            handleSetUser(userInfo)
            handleSetBearerKey(bearerKey)
        }
    }

    this.setState({ mountFinish: true })
  }
  
  verifyUserTest(){
    const url = "http://localhost:3001/verifyResearcher"
    const { handleSetBearerKey, handleSetUser } = this.props
    let json = {
      userName: "EdanTest",
      password: "EdanTest",
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
          console.log(json)
          if(json.result === "Verified"){
            handleSetUser(json.userInfo)
            handleSetBearerKey(json.bearerKey)
          }   
        })
    .catch(err => console.log(err));
  }

  render() {
    const { isLogged } = this.props
    const { mountFinish } = this.state

    return mountFinish ? (isLogged ? (<Redirect to='/homePage' />) : (
      <div className="loginHeader">
        <header className="header-login-signup">
          <div className="header-limiter">
            <h1><a href="#">YARR<span>!!</span></a></h1>
            <ul>
              <li><button onClick={this.verifyUserTest}>Login</button></li>
              <li><a href="#">Sign up</a></li>
            </ul>
          </div>
        </header>
      </div>
    )) : null
  }
}

export default connect(mapStateToProps, {...UserActions})(Login);
