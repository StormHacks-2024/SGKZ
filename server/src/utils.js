import { v4 as uuid } from 'uuid';

function getUUIDFromCookie(req) {
  return  uuid().toString() || req.cookies.uuid;
}

export { getUUIDFromCookie };