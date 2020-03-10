import './App.css'
import logo from './logo.svg'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import UserActions from './Actions/UserActions'

const mapStateToProps = ({user}) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey
  }
}

class App extends Component {
  constructor(props){
    super(props)
    this.userInfo = {userName: 1, email: "edan@gmail.com", firstName: "blah blah", lastName: "blahee"}
    this.getUserTest = this.getUserTest.bind(this)
    this.addUserTest = this.addUserTest.bind(this)
    this.verifyUserTest = this.verifyUserTest.bind(this)
  }

  componentDidMount(){
    const { handleSetUser } = this.props
    localStorage.removeItem("userInfo")
    if(!localStorage.getItem("userInfo")){
      console.log(`not in storage ${JSON.stringify(this.userInfo)}`)
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
    }
    
    let userInfo = JSON.parse(localStorage.getItem("userInfo"))
    console.log(userInfo)
    handleSetUser(userInfo) 
    this.getUserTest()
    this.addUserTest()
    this.verifyUserTest()
  }
  
  getUserTest(){
    const userName = "edanAzran";
    fetch(`http://localhost:3001/getResearcher?userName=${userName}`).then(res => res.json()).then(async json => {
      if(json.result === "Success"){
        console.log(json.user)
      }
    })
    .catch(err => console.log(err))   
  }

  addUserTest(){
    const url = "http://localhost:3001/addResearcher"

    let json = {
      userName: "EdanTest",
      password: "EdanTest",
      confirmedPassword: "EdanTest",
      firstName: "EdanTest",
      lastName: "EdanTest",
      email: "EdanTest@gmail.com"
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
            // if(json.result === "Success"){
              console.log(json)
            // }   
        })
    .catch(err => console.log(err));
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

  render(){
    return(
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    )
  }
}

export default connect(mapStateToProps, {...UserActions})(App);
