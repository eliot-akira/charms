import { Redirect, useHistory } from 'react-router'
import Status from './Status'

// See https://reacttraining.com/react-router/web/guides/server-rendering

const RedirectWithStatus = ({
  status = 302,
  from,
  to,
  push,
  exact,
  strict
}) => {

  const history = useHistory()

  // Prevent redirect to current route
  if (to===history.location.pathname) return ''

  return <Status code={status}>
    <Redirect {...{
      from,
      to,
      push,
      exact,
      strict
    }} />
  </Status>
}

export default RedirectWithStatus