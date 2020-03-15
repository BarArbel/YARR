import { connect } from 'react-redux'
import React, { Component } from 'react'
import UserActions from '../Actions/UserActions'

const mapStateToProps = ({ user }) => {
  return {
    isLogged: user.isLogged,
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
    const { isLogged } = this.props

    return (
      <div className="homePage">
        <header className="header-login-signup">
          <div className="header-limiter">
            <h1><a href="/">YARR!</a></h1>
            {/* <nav>
              <a href="/" className="selected">Home</a>
            </nav> */}
            {isLogged ? (<ul><li><button onClick={this.handleLogout}>Logout</button></li></ul>) : (null)}
          </div>
        </header>
      </div>
    )
  }
}

export default connect(mapStateToProps, { ...UserActions })(Header);
