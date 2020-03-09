import React, { Component } from 'react'
import { connect } from 'react-redux'
import testActions from './Actions/testActions'
import logo from './logo.svg'
import './App.css'

const mapStateToProps = ({test}) => {
  return {
    posts: test.posts,
    bearerKey: test.bearerKey
  }
}

class App extends Component {
  constructor(props){
    super(props)
    this.posts = [{id: 1, text: "blah blah"}, {id: 2, text: "due due"}]
    this.getUserTest = this.getUserTest.bind(this)
    this.addUserTest = this.addUserTest.bind(this)
    this.verifyUserTest = this.verifyUserTest.bind(this)
  }

  componentDidMount(){
    const { handleSetPosts } = this.props
    handleSetPosts(this.posts) 
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
    const { handleSetBearerKey } = this.props


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
            if(json.result === "Verified"){
              handleSetBearerKey(json.bearerKey)
            }   
        })
    .catch(err => console.log(err));
  }

  render(){
    console.log(this.props.bearerKey)
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

export default connect(mapStateToProps, {...testActions})(App);
