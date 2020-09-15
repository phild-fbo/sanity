/* eslint-disable complexity */
/* eslint-disable max-depth */
/* eslint-disable no-lonely-if */

import React from 'react'
import {Tool} from '../types'
import Navbar from './Navbar'

interface Props {
  createMenuIsOpen: boolean
  onCreateButtonClick: () => void
  onSearchClose: () => void
  onSearchOpen: () => void
  onSwitchTool: () => void
  onToggleMenu: () => void
  onUserLogout: () => void
  searchIsOpen: boolean
  tools: Tool[]
}

interface NextState {
  winWidth: number
  showLabel?: boolean
  showLabelMinWidth?: number
  showToolMenu?: boolean
  showToolMenuMinWidth?: number
}

interface State {
  showLabel: boolean
  showLabelMinWidth: number
  showToolMenu: boolean
  showToolMenuMinWidth: number
}

function getNextState(
  state: {
    showLabel: boolean
    showLabelMinWidth: number
    showToolMenu: boolean
    showToolMenuMinWidth: number
  },
  mostRight: number,
  winWidth: number
) {
  const {showLabel, showLabelMinWidth, showToolMenu, showToolMenuMinWidth} = state
  const mostRightIsVisible = mostRight && mostRight <= winWidth
  const nextState: NextState = {winWidth}

  if (mostRightIsVisible) {
    // most-right element is within viewport
    if (showLabel) {
      if (showLabelMinWidth === -1 || winWidth < showLabelMinWidth) {
        nextState.showLabelMinWidth = winWidth
      }
    } else if (showLabelMinWidth < winWidth) {
      nextState.showLabel = true
    }

    if (showToolMenu) {
      if (showToolMenuMinWidth === -1 || winWidth < showToolMenuMinWidth) {
        nextState.showToolMenuMinWidth = winWidth
      }
    } else if (showToolMenuMinWidth < winWidth) {
      nextState.showToolMenu = true
    }
  } else {
    // most-right element is NOT within viewport
    if (showLabel) {
      nextState.showLabel = false
    } else if (showToolMenu) {
      nextState.showToolMenu = false
    }
  }

  return nextState
}
/* eslint-enable complexity */
/* eslint-enable max-depth */
/* eslint-enable no-lonely-if */

class NavbarContainer extends React.PureComponent<Props, State> {
  state = {
    showLabel: false,
    showLabelMinWidth: -1,
    showToolMenu: false,
    showToolMenuMinWidth: -1,
    winWidth: -1
  }

  loginStatusElement = null
  searchElement = null
  tickAnimFrameId = null

  io = null

  componentDidMount() {
    // Start an animation frame loop to check whether elements within the Navbar
    // exits the viewport at any time.
    this.tick()
  }

  /* eslint-disable complexity */
  componentDidUpdate(prevProps: Props, prevState: State) {
    const {showLabel, showLabelMinWidth, showToolMenu, showToolMenuMinWidth} = this.state
    const didShowLabel = showLabelMinWidth === -1 && !prevState.showLabel && showLabel
    const didShowToolMenu = showToolMenuMinWidth === -1 && !prevState.showToolMenu && showToolMenu
    const didHideLabel = showToolMenuMinWidth === -1 && prevState.showLabel && !showLabel

    if (didShowLabel || didShowToolMenu || didHideLabel) {
      this.handleCustomResize(window.innerWidth)
    }
  }
  /* eslint-enable complexity */

  componentWillUnmount() {
    if (this.io) {
      this.io.disconnect()
      this.io = null
    }

    if (this.tickAnimFrameId) {
      window.cancelAnimationFrame(this.tickAnimFrameId)
      this.tickAnimFrameId = null
    }
  }

  tick = () => {
    this.handleFrame()
    this.tickAnimFrameId = window.requestAnimationFrame(this.tick)
  }

  handleFrame() {
    const winWidth = window.innerWidth
    if (winWidth !== this.state.winWidth) {
      this.handleCustomResize(winWidth)
    }
  }

  handleCustomResize(winWidth: number) {
    if (this.loginStatusElement) {
      const {showToolMenu} = this.state
      const mostRightRect = showToolMenu
        ? this.loginStatusElement.getBoundingClientRect()
        : this.searchElement.getBoundingClientRect()
      this.setState(state => {
        const nextState = getNextState(state, mostRightRect.left + mostRightRect.width, winWidth)
        return nextState as State
      })
    }
  }

  handleSetLoginStatusElement = (element: HTMLDivElement) => {
    this.loginStatusElement = element
  }

  handleSetSearchElement = (element: HTMLDivElement) => {
    this.searchElement = element
  }

  render() {
    const {
      createMenuIsOpen,
      onCreateButtonClick,
      onSearchClose,
      onSearchOpen,
      onSwitchTool,
      onToggleMenu,
      onUserLogout,
      // router,
      searchIsOpen,
      tools
    } = this.props
    const {showLabel, showToolMenu} = this.state

    return (
      <Navbar
        createMenuIsOpen={createMenuIsOpen}
        onCreateButtonClick={onCreateButtonClick}
        onSearchClose={onSearchClose}
        onSearchOpen={onSearchOpen}
        onSetLoginStatusElement={this.handleSetLoginStatusElement}
        onSetSearchElement={this.handleSetSearchElement}
        onSwitchTool={onSwitchTool}
        onToggleMenu={onToggleMenu}
        onUserLogout={onUserLogout}
        searchIsOpen={searchIsOpen}
        showLabel={showLabel}
        showToolMenu={showToolMenu}
        tools={tools}
      />
    )
  }
}

export default NavbarContainer
