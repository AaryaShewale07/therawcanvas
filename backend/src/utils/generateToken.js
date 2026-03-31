import jwt from 'jsonwebtoken'

const generateToken = (userId, rememberMe = false) => {
  // If remember me is checked, token expires in 90 days, else 7 days
  const expiresIn = rememberMe ? '90d' : '7d'
  
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  })
}

export default generateToken