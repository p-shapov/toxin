import * as F from 'fp-ts/function';
import {pipe} from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import {Eq} from 'fp-ts/Eq';
import {Plural} from 'globals/utils';
import {Ord} from 'fp-ts/Ord';

//

export const trace = <Type>(x: Type) => {
  console.log(x);

  return (x);
};

//

export const toString = (x: unknown) => `${x}`;

export const prop = <Obj, Key extends keyof Obj>(key: Key) => (object: Obj) => object[key];

export const ident = <Type>(x: Type) => x;

export const call = <Fn extends { (...args: any[]): ReturnType<Fn> }>(
  ...args: Fn extends { (...args: infer Args): any } ? Args : never
) => (fn: Fn) => fn(...args);

export const concat = (x: unknown) => (y: unknown) => `${y}${x}`;

export const method = <Instance extends Object, Key extends keyof Instance>(
  key: Instance[Key] extends Function ? Key : never,
  ...args: Instance[Key] extends { (...args: infer Args): any } ? Args : never
) => (instance: Instance): Instance[Key] extends { (...args: any): infer Return } ? Return : never => {
  return ((instance[key as Key] as Instance[Key] & Function)(...args));
};

export const switchCases = <Case extends [Tag, F.Lazy<Value>], Tag, Value>(cases: Case[], def: F.Lazy<Value>) => (tag: Tag) =>
  pipe(cases, A.findLast(([key]) => key === tag), O.fold<Case, Value>(() => def(), ([_, value]) => value()));

export const pluralize = (plural: Plural) => (count: number) => pipe(
  new Intl.PluralRules('ru'), method('select', count), (rule) => pipe(plural, prop(rule as | 'one' | 'few' | 'many'))
);

export const dateFormat = (options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('ru', options).format;

export const currencyFormat = (number: number) => pipe(
  new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }), method('formatToParts', number), A.map(({type, value}) => {
    if (type === 'literal') {
      return ('');
    }

    return value;
  }), join('')
);

export const test = (regexp: RegExp) => (x: string) => regexp.test(x);

export const compare = <Type>(ord: Ord<Type>) => (x: Type) => (y: Type) => ord.compare(y, x);

//

export const equals = <Type>(eq: Eq<Type>) => (x: Type) => (y: Type) => eq.equals(x, y);

export const not = (x: boolean) => !x;

//

export const sub = (x: number) => (y: number) => y - x;

export const add = (x: number) => (y: number) => x + y;

export const dec = (x: number) => sub(1)(x);

export const inc = (x: number) => add(1)(x);

export const div = (x: number) => (y: number) => y / x;

export const mult = (x: number) => (y: number) => x * y;

export const half = (x: number) => div(2)(x);

export const remainder = (x: number) => (y: number) => y % x;

export const toDays = (timestamp: number) => pipe(timestamp, div(1000 * 60 * 60 * 24), Math.trunc);

//

export const nthOrNone = <Type>(n: number, none: Type) => (xs: Type[]) => pipe(xs, A.lookup(n), O.getOrElse(F.constant(none)));

export const split = (sep: string) => (str: string) => str.split(sep);

export const values = <Obj>(obj: Obj) => Object.values(obj) as Array<Obj[keyof Obj]>;

export const keys = <Obj>(obj: Obj) => Object.keys(obj);

export const join = (sep: string) => (arr: Array<unknown>) => arr.join(sep);

export const includes = <Type>(x: Type) => (xs: Array<Type>) => xs.includes(x);

export const group = <Type>(eq: Eq<Type>): ((xs: Array<Type>) => Array<Array<Type>>) => A.chop((xs) => {
  const {init, rest} = pipe(xs, A.spanLeft((x: Type) => eq.equals(x, xs[0])));

  return [init, rest];
});

export const subAdjacent = (idx: number) => (xs: number[]) => {
  const current = nthOrNone(idx, NaN)(xs);

  const prev = nthOrNone(dec(idx), NaN)(xs);

  return (sub(prev)(current));
};

//

export const node = <NodeName extends keyof HTMLElementTagNameMap>(nodeName: NodeName) => document.createElement<NodeName>(nodeName);

export const addClassList = (classList: string[]) => <Node extends Element>(node: Node) => {
  node.classList.add(...classList);

  return (node);
};

export const removeClassList = (classList: string[]) => <Node extends Element>(node: Node) => {
  node.classList.remove(...classList);

  return (node);
};

export const containsClass = (className: string) => <Node extends Element>(node: Node) => node.classList.contains(className);

export const setInnerText = (text: string) => <Node extends HTMLElement>(node: Node) => {
  node.innerText = text;

  return (node);
};

export const setAttribute = (attrName: string, value?: string) => <Node extends HTMLElement>(node: Node) => {
  node.setAttribute(attrName, value ? value : attrName);

  return (node);
};

export const removeAttribute = (attrName: string) => <Node extends HTMLElement>(node: Node) => {
  node.removeAttribute(attrName);

  return (node);
};

export const addEventListener = <EventKey extends keyof HTMLElementEventMap>(
  event: EventKey, callback: (event: HTMLElementEventMap[EventKey]) => any
) => <Target extends EventTarget>(target: Target) => {
  target.addEventListener(event, callback as EventListenerOrEventListenerObject);

  return (target);
};

export const removeEventListener = <EventKey extends keyof HTMLElementEventMap>(
  event: EventKey, callback: (event: HTMLElementEventMap[EventKey]) => any
) => <Target extends EventTarget>(target: Target) => {
  target.removeEventListener(event, callback as EventListenerOrEventListenerObject);

  return (target);
};

export const querySelector = <Node extends Element>(
  selector: string
) => (parent: ParentNode) => pipe(parent.querySelector<Node>(selector), O.fromNullable);

export const querySelectorAll = <Node extends Element>(
  selector: string
) => (parent: ParentNode) => Array.from(parent.querySelectorAll<Node>(selector));