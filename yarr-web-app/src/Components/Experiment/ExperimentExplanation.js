import React, { Component } from "react";
import Tooltip from '@material-ui/core/Tooltip';

class ExperimentExplanation extends Component {

  constructor(props) {
    super(props)

    this.state = {
      onHover: -1
    }

    this.handleOnHover = this.handleOnHover.bind(this)
  }

  handleOnHover(val) {
    this.setState({ onHover: val })
  }

  render() {
    const { onHover } = this.state

    return (
      <div className="experimentExplanation">
        <svg
          viewBox="0 0 1005.3333 740"
          height="100%"
          width="100%"
        >
          <image style={{width: "100%", height: "100%"}} href={require("../../Images/Game.png")}/>
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="1005" height="38" y="87"/>
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="42" height="125" y="125" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="95" height="402" y="250" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="950" height="20" x="95" y="250" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="140" height="278" x="95" y="375" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="900" height="125" x="142" y="125" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="75" height="383" x="235" y="270" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="695" height="32" x="310" y="270" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="25" height="87" x="415" y="467" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="565" height="251" x="440" y="302" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="430" height="100" x="595" y="553" />
          <rect className={`svgBlock ${onHover !== -1 ? "nonFocus" : null}`} width="105" height="186" x="310" y="467" />

          <Tooltip title={"Parrot - The red character has to avoid its enemy "}>
            <rect 
              onMouseOver={() => this.handleOnHover(0)} 
              onMouseLeave={() => this.handleOnHover(-1)} 
              className={`svgBlock ${onHover !== -1 && onHover !== 0 ? "nonFocus" : null}`}
              stroke="#ffae42" 
              strokeWidth={onHover === -1 ? "2" : "0"} 
              width="100" 
              height="125" 
              x="42" 
              y="125"
            />
          </Tooltip>

          <Tooltip title={"Treasure - The red character has to pick it up"}>
            <rect 
              onMouseOver={() => this.handleOnHover(1)}
              onMouseLeave={() => this.handleOnHover(-1)} 
              className={`svgBlock ${onHover !== -1 && onHover !== 1 ? "nonFocus" : null}`}
              stroke="#ffae42" 
              strokeWidth={onHover === -1 ? "2" : "0"} 
              width="140" 
              height="105" 
              x="95" 
              y="270" 
            />
          </Tooltip>

          <Tooltip title={"Character - Controlled by a player"}>
            <rect 
              onMouseOver={() => this.handleOnHover(2)}
              onMouseLeave={() => this.handleOnHover(-1)} 
              className={`svgBlock ${onHover !== -1 && onHover !== 2 ? "nonFocus" : null}`}
              stroke="#ffae42" 
              strokeWidth={onHover === -1 ? "2" : "0"} 
              width="130" 
              height="165" 
              x="310" 
              y="302" 
            />
          </Tooltip>

          <Tooltip title={"Pile - The characters' goal is to put their treasures here"}>
            <rect 
              onMouseOver={() => this.handleOnHover(3)}
              onMouseLeave={() => this.handleOnHover(-1)} 
              className={`svgBlock ${onHover !== -1 && onHover !== 3 ? "nonFocus" : null}`}
              stroke="#ffae42" 
              strokeWidth={onHover === -1 ? "2" : "0"} 
              width="180" 
              height="100" 
              x="415"
              y="553" 
            />
          </Tooltip>
        </svg>
      </div>
    )
  }
}

export default ExperimentExplanation