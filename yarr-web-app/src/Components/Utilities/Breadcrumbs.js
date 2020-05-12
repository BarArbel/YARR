import { connect } from 'react-redux'
import React, { Component } from "react";
import { Link } from 'react-router-dom'

const mapStateToProps = ({ breadcrumbs }) => {
  return {
    routes: breadcrumbs.routes
  }
}

class Breadcrumbs extends Component {

  constructor(props) {
    super(props)
    this.eachRoute = this.eachRoute.bind(this)
    this.renderActive = this.renderActive.bind(this)
  }

  renderActive(route, index){
    const { name, redirect } = route

    return (
      <li className="breadcrumb-item" key={`route${index}`}>
        <Link to={redirect}>
          {name}
        </Link>
      </li>
    )
  }

  eachRoute(route, index){
    const { name, isActive } = route

    return isActive ? (this.renderActive(route, index)) : 
    (<li key={`route${index}`} className="breadcrumb-item active" aria-current="page">{name}</li>)
  }

  render() {
    const { routes } = this.props
    
    return (
      <div className="breadcrumbs">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {routes.map(this.eachRoute)}
          </ol>
        </nav>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Breadcrumbs)