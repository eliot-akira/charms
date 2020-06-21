import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { createStore } from 'medux'
import { createApi } from './api'

// Shortcut for import React from 'react'
global.React = React

export async function renderClient({
  App,
  storeProps,
  chunks
}) {

  /**
   * Await async components during development, so initial render is
   * exactly the same as from server. Skip this during production to
   * minimize time to initial render.
   */

  if (process.env.NODE_ENV==='development') {
    const promises = []
    for (const name of window.__INIT_CHUNKS__ || []) {
      if (chunks[name]) promises.push(
        chunks[name].loadComponent()
      )
    }
    // Run in parallel
    await Promise.all(promises)
  }

  const storeContext = {
    api: createApi()
  }

  const store = createStore({
    ...storeProps,
    state: window.__INIT_STATE__,
    context: storeContext
  })

  hydrate(
    <BrowserRouter>
      <HelmetProvider>
        <App store={store} />
      </HelmetProvider>
    </BrowserRouter>,
    document.getElementById('root')
  )
}
