import React from 'react'
import { NavLink } from 'react-router-dom'
import type { NavLinkProps } from 'react-router-dom'

export default function Link({
  to,
  children = [],
  exact = true,
  ...props
}: NavLinkProps & {
  to: string
}) {

  const isExternal = to && to.indexOf(':') >= 0 // to.match(externalUrl)
  const isDownload = to && to.indexOf('.') >= 0

  if (!to || isExternal || isDownload) {
    return (
      <a {...{ ...props, href: to,
        target: isExternal || isDownload ? '_blank' : undefined, // '_self'
        children
      }} />
    )
  }

  // Add trailing slash
  // if (to.indexOf('.') < 0 && to.substr(-1)!=='/') {
  //   to += '/'
  // }

  return <NavLink {...{
    ...props,
    children,
    to: to,
    exact,
    isActive: (match, location) => {

      const routeName = location.pathname.replace(/\/$/, '') || '/'
      const targetRouteName = to.replace(/\/$/, '') || '/'

      if (exact===true) return routeName===targetRouteName

      const len = to.length

      return routeName.substring(0, len)===targetRouteName
        && (!routeName[len] || routeName[len]==='/')
    }
  }} />
}