import { MDBBtn } from 'mdbreact'
import React, { Component } from "react";

class DeleteConfirmation extends Component {

  constructor(props) {
    super(props)

    this.state = {
      userTitleInput: "",
    }
  }


  render() {
    const { onClose, onDelete, objectType, objectTitle, objectId, subType } = this.props
    const { userTitleInput } = this.state
    const confirmDelete = userTitleInput === objectTitle

    return (
      <div className="deleteConfirmation">
        <div className='custom-ui card'>
          <div className="card-body">
            <h1 className="warningText">WARNING!</h1>
            <hr />
            <p>Deleting your {objectType} and its data is irreversible.</p>
            {subType && <p>Deleting this {objectType} will delete <b>ALL</b> {subType} releated to it...</p>}
            <p>Enter your {objectType}'s name (<b>{objectTitle}</b>) below to confirm you want to permanently delete it</p>
            <input
              className="form-control"
              value={userTitleInput}
              onChange={(event) => { this.setState({ userTitleInput: event.target.value }) }}
              name="userTitleInput"
            />
            <hr />
            <MDBBtn
              onClick={() => {
                onDelete(objectId)
                onClose()
              }}
              disabled={!confirmDelete}
              color="danger"
              outline={confirmDelete ? false : true}
              className="popUpButton"
            >
              Delete {objectType}
              </MDBBtn>
            <MDBBtn color="blue-grey" className="popUpButton" onClick={onClose}>Cancle</MDBBtn>
          </div>
        </div>
      </div>
    )
  }
}

export default DeleteConfirmation