import React from 'react'
import { Route } from 'react-router-dom'

export default function Status({
  status,
  code,
  children = null
}) {
  return (
    <Route
      render={({ staticContext }: { staticContext: { [key: string]: any } }) => {
        // For server side to set response status code
        if (staticContext) staticContext.status = status || code
        return children
      }}
    />
  )
}
