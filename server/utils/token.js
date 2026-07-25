import jwt from 'jsonwebtoken';

const cookieName = 'rigora_token';

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function sendAuthResponse(response, statusCode, user) {
  const token = signToken(user.id);
  response
    .status(statusCode)
    .cookie(cookieName, token, getCookieOptions())
    .json({ user });
}

export function clearAuthCookie(response) {
  const options = getCookieOptions();
  delete options.maxAge;
  response.clearCookie(cookieName, options);
}

export { cookieName };
