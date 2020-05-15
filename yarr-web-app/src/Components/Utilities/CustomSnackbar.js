import React, { Component } from "react"
import Snackbar from '@material-ui/core/Snackbar'
import { makeStyles } from '@material-ui/core/styles'
import MuiAlert from '@material-ui/lab/Alert'

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
  }

  render() {
    const { severity, open, onClose, msg } = this.props

    return (
      <div className={useStyles.root}>
        <Snackbar open={open} autoHideDuration={3000} onClose={onClose} severity={severity}>
          <Alert onClose={onClose} severity={severity}>
            {msg}
          </Alert>
        </Snackbar>
      </div>
    )
  }
}

export default CustomSnackbar