import { MDBIcon } from 'mdbreact'
import React, { Component } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';

class CodeView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      copied: false
    }
  }
  render() {
    const { onClose, gameCode } = this.props

    return (
      <div className="codeView">
        <div className='custom-ui card'>
          <div className="card-body gameCodeCard">
            <h1 className="centerText">Game Code</h1>
            <hr />
            <div className="gameCodeWrapper">
              <label className="gameCodeLabel"><b>{gameCode}</b></label>
            </div>
            <CopyToClipboard text={gameCode}
              onCopy={() => this.setState({ copied: true })}>
              <button className="gameCodeCopy">Copy</button>
            </CopyToClipboard>
            {this.state.copied ? <label className="centerText" style={{ color: '#62c462', width: '100%', marginTop: '5px' }}>Game Code Copied!</label> : null}
            <button onClick={onClose} className="invisButton"><MDBIcon icon="times" /></button>
          </div>
        </div>
      </div>
    )
  }
}

export default CodeView