import { connect } from 'react-redux'
import React, { Component } from 'react'
import UserActions from '../Actions/UserActions'
import StudyActions from '../Actions/StudyActions'

const mapStateToProps = ({ user }) => {
  return {
    userInfo: user.userInfo,
    isLogged: user.isLogged,
    bearerKey: user.bearerKey,
  }
}

class Header extends Component {
  constructor(props) {
    super(props)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout() {
    const { handleRemoveUser, handleRemoveBearerKey } = this.props
    handleRemoveUser()
    handleRemoveBearerKey()
  }

  render() {
    const { userInfo, isLogged } = this.props

    return  (
      <div className="header">
        <header className="header-login-signup">
          <div className="header-limiter">
          <a href="/"><img src={require('../Images/logo2.png')} alt="Yarr!" id="logo"/></a>
            {isLogged ? 
              <ul>
                <li>Hello {userInfo.firstName} {userInfo.lastName}</li>
                <li><button onClick={this.handleLogout}>Logout</button></li>
              </ul> 
              : null
            }
          </div>
        </header>
      </div>
    )
  }
}

export default connect(mapStateToProps, { ...UserActions, ...StudyActions })(Header);
