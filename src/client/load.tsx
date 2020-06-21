import { Component } from 'react'

// Client-side load
// export const Test = load(() => import(/* webpackChunkName: "Test" */ './pages/Test'))

export default function loadAsync(getComponent) {

  return class AsyncComponent extends Component {

    static Loaded = null

    // Client can call this before page load
    static loadComponent() {
      return getComponent()
        .then(C => (AsyncComponent.Loaded = C.default || C))
    }

    state = {
      loaded: AsyncComponent.Loaded ? true : false
    }

    mounted = false

    constructor(props) {
      super(props)
      if (this.state.loaded) return
      AsyncComponent.loadComponent()
        .then(() => this.mounted && this.setState({ loaded: true }))
    }

    componentDidMount() {
      this.mounted = true
    }

    componentWillUnmount() {
      this.mounted = false
    }

    render() {
      return this.state.loaded
        ? <AsyncComponent.Loaded {...this.props} />
        : null // TODO: Loading indicator?
    }
  }
}
