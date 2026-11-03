import { describe, expect, it } from 'vitest';

import { toCsv } from './csv';

describe('toCsv', () => {
  it('uses CRLF line endings', () => {
    expect(toCsv(['a', 'b'], [['1', '2']])).toBe('a,b\r\n1,2\r\n');
  });
  it('quotes commas, quotes and newlines', () => {
    expect(toCsv(['x'], [['a,b'], ['say "hi"'], ['l1\nl2']])).toBe(
      'x\r\n"a,b"\r\n"say ""hi"""\r\n"l1\nl2"\r\n',
    );
  });
  it('renders null as empty', () => {
    expect(toCsv(['a', 'b'], [[null, 1]])).toBe('a,b\r\n,1\r\n');
  });
  it.each(['=1+1', '+1', '-1', '@x', '\tx'])('prefixes %j', (v) => {
    expect(toCsv(['a'], [[v]])).toBe(`a\r\n'${v}\r\n`);
  });
  it('quotes and prefixes a leading CR', () => {
    expect(toCsv(['a'], [['\rx']])).toBe('a\r\n"\'\rx"\r\n');
  });
  it('never prefixes numbers', () => {
    expect(toCsv(['a'], [[-5], [1.5]])).toBe('a\r\n-5\r\n1.5\r\n');
  });
});
