import { forwardRef } from 'react'

const Svg = forwardRef((props, ref) =>
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  />
)

export default Svg
