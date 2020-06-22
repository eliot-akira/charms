import Highlight, { defaultProps } from 'prism-react-renderer'
import Prism from 'prism-react-renderer/prism'
// import 'charms/prism/themes/light.scss'

// https://mdxjs.com/guides/syntax-highlighting

export default ({ children = '', className = '' }) => {

  const language = className.replace(/language-/, '')
  if (typeof children!=='string') {
    children = (children.props && children.props.children) || ''
  }
  return (
    <Highlight {...defaultProps} code={children} language={language || 'markup'} theme={undefined}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          <code>{
            tokens.slice(0, -1) // Last token is always empty
              .map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {
                    // Preserve empty lines
                    // https://github.com/FormidableLabs/prism-react-renderer/issues/36
                    line.length===1 && line[0].content===''
                      ? ' '
                      : line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))
                  }
                </div>
              ))}</code>
        </pre>
      )}
    </Highlight>
  )
}
