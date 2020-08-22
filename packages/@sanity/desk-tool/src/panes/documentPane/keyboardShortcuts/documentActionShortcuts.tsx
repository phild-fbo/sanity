/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-multi-comp */

import React from 'react'
import {RenderActionCollectionState} from 'part:@sanity/base/actions/utils'
import {useEditState} from '@sanity/react-hooks'
import resolveDocumentActions from 'part:@sanity/base/document-actions/resolver'
import isHotkey from 'is-hotkey'
import {ActionStateDialog} from '../documentPanel/statusBar'
import {useDocument} from '../utils/document'

interface ResponderProps {
  states: any[]
  activeIndex: number
  onActionStart: (index: number) => void
}

function KeyboardShortcutResponder({
  states,
  children,
  onKeyDown,
  activeIndex,
  onActionStart,
  ...rest
}: React.HTMLProps<HTMLDivElement> & ResponderProps) {
  const active = states[activeIndex]

  const handleKeyDown = React.useCallback(
    event => {
      const matchingStates = states.filter(
        state => state.shortcut && isHotkey(state.shortcut, event)
      )
      const matchingState = matchingStates[0]
      if (matchingState) {
        event.preventDefault()
      }
      if (matchingStates.length > 1) {
        console.warn(
          `Keyboard shortcut conflict: More than one document action matches the shortcut "${matchingState.shortcut}"`
        )
      }
      if (matchingState && !matchingState.disabled) {
        matchingState.onHandle()
        onActionStart(states.indexOf(matchingState))
      }
      if (onKeyDown) {
        onKeyDown(event)
      }
    },
    [states]
  )
  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1} {...rest}>
      {children}
      {active && active.dialog && <ActionStateDialog dialog={active.dialog} />}
    </div>
  )
}

export const DocumentActionShortcuts = React.memo((props: React.HTMLProps<HTMLDivElement>) => {
  const {children, ...rest} = props
  const doc = useDocument()
  const editState = useEditState(doc.id, doc.typeName)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const onActionStart = React.useCallback(idx => setActiveIndex(idx), [])
  const actions = editState ? resolveDocumentActions(editState) : null

  return actions ? (
    <RenderActionCollectionState
      actions={actions}
      actionProps={editState}
      component={KeyboardShortcutResponder}
      onActionStart={onActionStart}
      activeIndex={activeIndex}
      {...rest}
    >
      {children}
    </RenderActionCollectionState>
  ) : null
})

DocumentActionShortcuts.displayName = 'DocumentActionShortcuts'
