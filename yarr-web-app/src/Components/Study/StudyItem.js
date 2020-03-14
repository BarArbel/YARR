import React, { Component } from "react";

class StudyItem extends Component {
  constructor(props) {
    super(props);

    this.renderRegular = this.renderRegular.bind(this);
  }

  renderRegular() {
    return (
      <span>
        {/* <button onClick={this.addToFav} className="btn btn-primary addToFav nonFav"><MdFavoriteBorder className="Heart" />Add To Favorites</button> */}
      </span>
    )
  }

  render() {
    return (
      <div className="studyItem">
        {this.props.children}
        {/* {this.renderRegular()} */}
      </div>
    )
  }
}

export default StudyItem;