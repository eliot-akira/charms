import { Route, Switch } from 'react-router-dom'

/**
 * Wrapper for <Route> that passes child routes in a `routes` prop to
 * the component it renders.
 *
 * @see https://reacttraining.com/react-router/web/example/route-config
 *
 * Parent route should render child routes:
 *
 * ```js
 * const ParentRoute = ({ routes }) =>
 *   <>{ renderRoutes(routes) }</>
 * ```
 */
export default function renderRoutes(routes, routeProps) {
  return <Switch>
    {routes.map((route, i) => (
      <Route key={i}
        path={route.path}
        exact={typeof route.exact=='undefined' ? !route.routes : route.exact}
        render={props => (
          <route.component
            {...routeProps}
            {...props}
            routes={route.routes}
          />
        )}
      />
    ))}
  </Switch>
}
