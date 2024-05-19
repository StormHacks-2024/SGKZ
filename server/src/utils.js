import { v4 as uuid } from 'uuid';

function getUUIDFromCookie(req) {
  return req.cookies?.uuid || uuid().toString();
}

export { getUUIDFromCookie };