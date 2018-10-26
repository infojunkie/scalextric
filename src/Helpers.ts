export namespace Helpers {

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
  export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

}
