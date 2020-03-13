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

    this.handleLogout = this.handleLogout.bind(this)
  }

  async componentDidMount(){
    const { isLogged, handleSetUser, handleSetBearerKey } = this.props
   
    /* If not in state, check if in local storage */
    if(!isLogged){
      /* If in local storage, add it to state */ 
      if(localStorage.getItem("isLogged") != null){
          const isLogged = JSON.parse(localStorage.getItem("isLogged"))
          if(isLogged){
            const userInfo = JSON.parse(localStorage.getItem("userInfo"))
            const bearerKey = localStorage.getItem("bearerKey")
            handleSetUser(userInfo)
            handleSetBearerKey(bearerKey)
          }
      }
    }

    this.setState({ mountFinish: true })
  }

  handleLogout(){
    const { handleRemoveUser, handleRemoveBearerKey } = this.props
    handleRemoveUser()
    handleRemoveBearerKey()
  }
  
  render() {
    const { isLogged, userInfo, bearerKey } = this.props
    const { mountFinish } = this.state
    return mountFinish ? (isLogged ? (
      <div className="homePage">
        <header className="header-login-signup">
          <div className="header-limiter">
            <h1><a href="#">YARR<span>!!</span></a></h1>
            <nav>
              <a href="#" className="selected">Home</a>
            </nav>
            <ul>
              <li><button onClick={this.handleLogout}>Logout</button></li>
            </ul>
          </div>
        </header>
      </div>
    ) : (<Redirect to='/' />)) : (null)
  }
}

export default connect(mapStateToProps, {...UserActions})(HomePage);
