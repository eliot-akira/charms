import React, { Component, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router'
import { Link } from 'charms/router'
import { Helmet } from 'react-helmet-async'
import { MDXProvider } from '@mdx-js/react'
import { Link as ScrollLink } from 'react-scroll'
import { connectReduxDevTools } from 'medux/redux-devtools'

import { renderRoutes } from '../router'
import CodeBlock from '../components/CodeBlock'

const defaultMeta = {
  defaultTitle: 'App',
  // titleTemplate: '%s | App',
  htmlAttributes: { lang: 'en' },
  meta: [
    { name: 'description', content: '' }
  ],
  link: [
    { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
  ]
}

const defaultMarkdownComponents = {
  Helmet,
  wrapper: ({ meta, children }) =>
    <>
      { // MDX file can export const meta
        meta && <Helmet {...meta} />
      }
      <article className="mt-2 px-2 pb-3"  children={children} />
    </>
  ,
  pre: CodeBlock,
  a: props => {
    const { href, children, ...moreProps } = props
    if (href && href[0]==='#') {
      return <ScrollLink
        containerId="root"
        activeClass="active"
        to={href.substr(1)}
        offset={-20}
        smooth={true}
      >
        {children}
      </ScrollLink>
    }
    return <Link {...{
      to: href,
      children,
      ...moreProps
    }} />
  }
}

const ScrollTop = withRouter(class ScrollTopOnRouteChange extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    return null
  }
})

const Provider = ({
  store,
  routes,
  location, // { pathname, search, hash }
  meta = {},
  markdownComponents = {},
  children,
  ...props
}) => {

  useEffect(() => {
    connectReduxDevTools(store)
    window.app = store
  }, [])

  const Wrapper = markdownComponents.wrapper || defaultMarkdownComponents.wrapper

  // MDX file can export const meta, which is passed to Helmet
  const mdxComponents = useMemo(() => {
    return {
      ...defaultMarkdownComponents,
      ...markdownComponents,
      wrapper: ({ meta, children, ...props }) =>
        <Wrapper {...{
          meta, ...props
        }}>
          { meta && <Helmet {...meta} /> }
          { children }
        </Wrapper>
    }
  }, [markdownComponents])

  const {
    bodyAttributes = {}
  } = meta

  // Provide route-specific body classes
  const bodyClassName = `route${
    location.pathname==='/' ? '--home' : location.pathname.replace(/\/$/, '').replace(/\//g, '--')
  }`+(bodyAttributes.className ? ' '+bodyAttributes.className : '')

  return <MDXProvider components={mdxComponents}>
    <ScrollTop />
    <Helmet {...{
      ...defaultMeta,
      ...meta,
      bodyAttributes: {
        ...bodyAttributes,
        class: bodyClassName
      }
    }} />
    { children }
  </MDXProvider>
}

export const AppProvider = withRouter(Provider)
export { renderRoutes }
