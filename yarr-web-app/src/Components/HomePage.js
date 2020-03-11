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

class HomePage extends Component {
  constructor(props){
    super(props)

    this.state = {
        mountFinish: false
    }
  }

  componentDidMount(){
    const { isLogged, handleSetUser, handleSetBearerKey, handleRemoveUser } = this.props

    /* If not in state, check if in local storage */
    if(!isLogged){
        /* If in local storage, add it to state */ 
        if(localStorage.getItem("isLogged")){
            console.log(localStorage.getItem("isLogged"))
            const userInfo = JSON.parse(localStorage.getItem("userInfo"))
            const bearerKey = JSON.parse(localStorage.getItem("bearerKey"))
            handleSetUser(userInfo)
            handleSetBearerKey(bearerKey)
        }
    }

    this.setState({ mountFinish: true })
  }
  
  render(){
    const { isLogged, userInfo } = this.props
    const { mountFinish } = this.state
    console.log(userInfo)
    return mountFinish ? (isLogged ? (<div className = "login">homepage</div>) : (<Redirect to = '/'/>)) : (null)
  }
}

export default connect(mapStateToProps, {...UserActions})(HomePage);
