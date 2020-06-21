import { Route } from 'react-router-dom'

export default function Status({ status, code, children }) {
  return (
    <Route
      render={({ staticContext }) => {
        // For server side to set response status code
        if (staticContext) staticContext.status = status || code
        return children
      }}
    />
  )
}
