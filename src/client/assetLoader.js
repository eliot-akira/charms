/**
 * Asset loader: JS and CSS with dependencies
 */
const loading = {} // name => Promise
const loaded = {}  // name => true

async function assetLoader(assets) {

  if (Array.isArray(assets)) {
    return await Promise.all(assets.map(assetLoader))
  }

  if (typeof assets === 'string') {
    assets = { file: assets }
  }

  const {
    file = '',
    depend = []
  } = assets

  // Ensure dependencies
  if (depend.length) await assetLoader(depend)

  if (loaded[ file ]) return // Ready

  if ( ! loading[ file ] ) {

    loading[ file ] = new Promise((resolve, reject) => {

      // Create DOM element and await loaded

      const extension = file.split('.').pop()

      const handler = function(e) {

        delete loading[ file ]

        if (e.type[0]==='e') return reject() // e.type is 'load' or 'error'

        loaded[ file ] = true
        resolve()
      }

      if (extension==='css') {

        const el = window.document.createElement('link')

        el.onload = el.onerror = handler
        el.rel = 'stylesheet'
        el.href = file

        window.document.head.appendChild(el)

        return
      }

      if (extension==='js') {

        const el = window.document.createElement('script')

        el.onload = el.onerror = handler
        el.src = file

        window.document.head.appendChild(el)

        return
      }

      reject('Unknown file extension: '+file)
    })
  }

  return await loading[ file ]
}

export default assetLoader