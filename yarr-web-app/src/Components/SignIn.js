import { MDBBtn } from 'mdbreact'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { Component } from 'react'


class SignIn extends Component {

  constructor(props) {
    super(props)

    this.state = {
      email: "",
      userName: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      signUp: false
    }

    this.renderLogin = this.renderLogin.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeForm = this.handleChangeForm.bind(this)
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this)
    this.handleSignUpSubmit = this.handleSignUpSubmit.bind(this)
  }

  handleChangeForm() {
    this.setState({signUp: !this.state.signUp})
  }

  handleChange(event) {
    const { name, value } = event.target
    this.setState({ [name]: value });
  }

  handleLoginSubmit(event) {
    const { userName, password } = this.state
    const { verifyUser } = this.props

    verifyUser(userName, password)
    event.preventDefault();
  }

  handleSignUpSubmit(event){
    const { 
      userName, 
      password, 
      confirmPassword, 
      firstName, 
      lastName, 
      email 
    } = this.state

    console.log(this.state)
    event.preventDefault();
  }

  renderLogin(){
    const { userName, password } = this.state

    return (
      <form onSubmit={this.handleLoginSubmit}>
        <p className="h4 text-center mb-4">Log in</p>
        <label htmlFor="defaultFormLoginEmailEx" className="grey-text">
          Your user name
          </label>
        <input
          value={userName}
          onChange={this.handleChange}
          id="defaultFormLoginEmailEx"
          className="form-control userNameInput"
          name="userName"
          required
        />
        <label htmlFor="defaultFormLoginPasswordEx" className="grey-text">
          Your password
          </label>
        <input
          value={password}
          onChange={this.handleChange}
          type="password"
          id="defaultFormLoginPasswordEx"
          className="form-control"
          name="password"
          required
        />
        <div className="text-center mt-4">
          <MDBBtn color="elegant" type="submit" className="login-btn">Login</MDBBtn>
        </div>
      </form>
    )
  }

  renderSignUp(){
    const {
      userName,
      password,
      confirmPassword,
      firstName,
      lastName,
      email
    } = this.state
    
    return(
      <form onSubmit={this.handleSignUpSubmit}>
        <p className="h4 text-center mb-4">Sign up</p>
        <label htmlFor="defaultFormSignInUser" className="grey-text">
          Enter a User Name
        </label>
        <input
          value={userName}
          onChange={this.handleChange}
          id="defaultFormSignInUser"
          className="form-control FormMargins"
          name="userName"
          required
        />
        <label htmlFor="defaultFormSignInFirstName" className="grey-text">
          Enter Your First Name
        </label>
        <input
          value={firstName}
          onChange={this.handleChange}
          id="defaultFormSignInFirstName"
          className="form-control FormMargins"
          name="firstName"
          required
        />
        <label htmlFor="defaultFormSignInLastName" className="grey-text">
          Enter Your Last Name
        </label>
        <input
          value={lastName}
          onChange={this.handleChange}
          id="defaultFormSignInLastName"
          className="form-control FormMargins"
          name="lastName"
          required
        />
        <label htmlFor="defaultFormSignInEmail" className="grey-text">
          Enter Your Email
        </label>
        <input
          value={email}
          onChange={this.handleChange}
          id="defaultFormSignInEmail"
          className="form-control FormMargins"
          name="email"
          type="email"
          required
        />
        <label htmlFor="defaultFormSignInPassword" className="grey-text">
          Enter a Password
        </label>
        <input
          value={password}
          onChange={this.handleChange}
          type="password"
          id="defaultFormSignInPassword"
          className="form-control FormMargins"
          name="password"
          required
        />
        <label htmlFor="defaultFormSignInConfirm" className="grey-text">
          Confirm Password
        </label>
        <input
          value={confirmPassword}
          onChange={this.handleChange}
          type="password"
          id="defaultFormSignInConfirm"
          className="form-control"
          name="confirmPassword"
          required
        />
        <div className="text-center mt-4">
          <MDBBtn color="elegant" type="submit" className="login-btn">Sign up</MDBBtn>
        </div>
      </form>
    )
  }

  render() {
    const { signUp } = this.state
    const buttonText = signUp ? "Go back to Login" : "Don't have an account? Sign up here"

    return (
      <div className="signIn">
        {signUp ? this.renderSignUp() : this.renderLogin()}
        <button className="changeFormButton" onClick={this.handleChangeForm}>{buttonText}</button>
      </div>
    )
  }
}

SignIn.propTypes  = {
  verifyUser: PropTypes.func
}

export default connect()(SignIn)