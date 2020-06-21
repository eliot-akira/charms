
export const cleanUser = data => {

  if (!data || typeof data!=='object') return data

  const {
    password, // Shouldn't exist but just in case
    hashedPassword,
    ...cleanData
  } = data

  return cleanData
}

export const withHashedPassword = async (data, context) => {

  const {
    auth
  } = context

  const {
    password,
    ...fields
  } = data

  if (!password) return data

  const hashedPassword = await auth.createHash(password)

  return {
    ...fields,
    hashedPassword
  }
}

export const isAdmin = async (user) => {
  return user && user.roles && user.roles.indexOf('admin')>=0
}
