
export type OptionsForParseRegExp = {
  addFlags?: string;
  delFlags?: string;
}
export function parseRegExp(str: string, opts?: OptionsForParseRegExp) {
  if (!str || typeof str !== 'string' || str[0] !== '/')
    throw new Error(`invalid regexp string (it is not started with "/")`);
  const lastIndex = str.lastIndexOf('/');
  if (lastIndex <= 0)
    throw new Error(`invalid regexp string (it is not paired "/")`);
  const regexp = str.slice(1, lastIndex);
  let flags = str.slice(lastIndex + 1);
  if (opts) {
    const { addFlags, delFlags } = opts;
    const flagsSet = new Set(flags.split(''));
    if (addFlags && typeof addFlags === 'string') {
      addFlags.split('').forEach(ch => flagsSet.add(ch));
      flags = Array.from(flagsSet).join('')
    }
    if (delFlags && typeof delFlags === 'string') {
      delFlags.split('').forEach(ch => flagsSet.delete(ch));
      flags = Array.from(flagsSet).join('')
    }
  }
  return new RegExp(regexp, flags);
}
