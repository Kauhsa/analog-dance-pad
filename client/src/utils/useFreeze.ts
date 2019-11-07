import React from 'react'

const useFreeze = (node: React.ReactNode, frozen: boolean) => {
  const renderedNode = React.useRef(node)

  if (!frozen) {
    renderedNode.current = node
  }

  return renderedNode.current
}

export default useFreeze
