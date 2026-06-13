export function toID(text) {
  const lcase = ('' + text).toLowerCase();
  if (lcase === 'flabébé') return 'flabebe';
  return lcase.replace(/[^a-z0-9]+/g, '');
}

export function error(err, msg) {
  if (err) {
    throw new Error(msg);
  } else {
    console.log(msg);
  }
}
