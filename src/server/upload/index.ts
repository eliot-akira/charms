import path from 'path'
import { send } from 'micro'
import fileUpload from 'express-fileupload'

export const upload = function(opts, fn?) {
  if (!fn) {
    fn = opts
    opts = {}
  }

  const handler = fileUpload(opts)

  return (req, res) => {
    return new Promise(resolve => handler(req, res, resolve))
      .then(() => fn(req, res))
  }
}

export const move = function(src, dst) {
  return new Promise((resolve, reject) => {
    if (!src || typeof src.mv !== 'function') {
      reject(new TypeError('First argument must be an upload file object'))
    }

    src.mv(dst, err => err ? reject(err) : resolve())
  })
}

export const createUploadHandler = opts => upload(async (req, res) => {

  if (!req.files) {
    return send(res, 400, 'No file uploaded')
  }

  const file = req.files.file

  // TODO: Ensure file stays within uploads path

  const targetFilePath = path.join(opts.uploadsPath, file.name)

  await move(file, targetFilePath)

  send(res, 200, 'Upload success')
})
