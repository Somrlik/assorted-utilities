/**
 * Generates somewhat random UUIDs in browser
 *
 * Should be replaced by `generateUUID()` when implemented.
 *
 * @see https://github.com/tc39/proposal-uuid
 */
export function generateUUID(): string {
  if (typeof crypto === 'undefined') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } else {
    return (`${1e7}` + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (parseInt(c, 10) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c, 10) / 4).toString(16)
    );
  }
}
