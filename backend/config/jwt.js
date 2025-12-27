module.exports = {
  secret: process.env.JWT_SECRET || 'stepseven_super_secret_jwt_key_change_in_production',
  expiresIn: process.env.JWT_EXPIRE || '7d',
  cookieExpire: 7, // days
  
  // Token options
  options: {
    algorithm: 'HS256',
    issuer: 'stepseven-api',
    audience: 'stepseven-users'
  },

  // Cookie options
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
};