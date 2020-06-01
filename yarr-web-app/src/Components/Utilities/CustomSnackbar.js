import { connect } from 'react-redux'
import React, { Component } from "react"
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import { makeStyles } from '@material-ui/core/styles'
import SnackbarActions from '../../Actions/SnackbarActions'

const mapStateToProps = ({ snackbar }) => {
  return {
    msg: snackbar.msg,
    open: snackbar.open,
    severity: snackbar.severity
  }
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}))

class CustomSnackbar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      open: props.open
    }

    this.handleClose = this.handleClose.bind(this)
  }

  handleClose(event, reason) {
    const { handleResetSnackbar } = this.props
    if (reason === 'clickaway') {
      return
    }
    
    handleResetSnackbar()
  }

  render() {
    const { severity, open, msg } = this.props

    return (
      <div className={useStyles.root}>
        <Snackbar open={open} autoHideDuration={3000} onClose={this.handleClose} severity={severity}>
          <Alert onClose={this.handleClose} severity={severity}>
            {msg}
          </Alert>
        </Snackbar>
      </div>
    )
  }
}

export default connect(mapStateToProps, { ...SnackbarActions })(CustomSnackbar)