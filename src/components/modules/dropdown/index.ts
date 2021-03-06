import {flow, pipe} from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as H from 'globals/helpers';
import * as A from 'fp-ts/Array';
import * as F from 'fp-ts/function';

import Namespace from './namespace';

class Dropdown implements Namespace.Interface {
  public readonly setExpanded = (expanded: boolean) => {
    pipe(this.root, O.map(pipe([`${this.bemBlockName}_expanded`], expanded ? H.addClassList : H.removeClassList)));
    pipe(this.button, A.map(H.setAttribute('aria-expanded', H.toString(expanded))));
    pipe([this.setOutsideClickSideEffect, this.setFocusTrapSideEffect, this.setEscapeKeyPress], A.map(
      H.call(expanded ? 'add' : 'remove')
    ));

    return (this);
  };

  constructor(private readonly bemBlockName: string, private readonly wrap: HTMLElement) {
    this.initButton();
  }

  protected readonly root = pipe(this.wrap, H.querySelector<HTMLDivElement>(`.js-${this.bemBlockName}`));
  protected readonly button = pipe(this.wrap, H.querySelectorAll<HTMLElement>(`.js-${this.bemBlockName}__button`));

  private readonly initButton = () => pipe(this.button, A.map(flow(H.addEventListener('click', this.toggleExpanded))));

  private readonly getAllFocusable = () => pipe(
    this.wrap, H.querySelectorAll<HTMLElement>('input, button:not([tabindex="-1"]), div[tabindex="0"]')
  );

  private readonly setFocusTrapSideEffect = (type: 'add' | 'remove') => pipe(type, H.switchCases([
    ['add', this.initFocusTrap], ['remove', this.removeFocusTrap]
  ], F.constVoid));

  private readonly initFocusTrap = () => {
    const focusable = this.getAllFocusable();

    pipe(focusable, A.head, O.map(H.addEventListener('blur', this.handleHeadBlur)));
    pipe(focusable, A.last, O.map(H.addEventListener('blur', this.handleLastBlur)));
  };

  private readonly removeFocusTrap = () => {
    const focusable = this.getAllFocusable();

    pipe(focusable, A.head, O.map(H.removeEventListener('blur', this.handleHeadBlur)));
    pipe(focusable, A.last, O.map(H.removeEventListener('blur', this.handleLastBlur)));
  };


  private readonly setEscapeKeyPress = (type: 'add' | 'remove') => {
    const focusable = this.getAllFocusable();

    pipe(type, H.switchCases([
      ['add', () => pipe(focusable, A.map(H.addEventListener('keyup', this.handleEscapePress)))],
      ['remove', () => pipe(focusable, A.map(H.removeEventListener('keyup', this.handleEscapePress)))]
    ], F.constVoid))
  };

  private readonly setOutsideClickSideEffect = (type: 'add' | 'remove') => pipe(type, H.switchCases([
    ['add', () => H.addEventListener('click', this.handleOutsideClick)(document)],
    ['remove', () => H.removeEventListener('click', this.handleOutsideClick)(document)]
  ], F.constVoid));

  private readonly toggleExpanded = () => pipe(this.root, O.map(flow(
    H.containsClass(`${this.bemBlockName}_expanded`), H.not, this.setExpanded
  )));

  private readonly handleHeadBlur = ({relatedTarget}: FocusEvent) => pipe(this.getAllFocusable(), A.last, O.map(
    relatedTarget && !this.wrap.contains(relatedTarget as Node) ? H.method('focus') : H.ident
  ));

  private readonly handleLastBlur = ({relatedTarget}: FocusEvent) => pipe(this.getAllFocusable(), A.head, O.map(
    (relatedTarget && !this.wrap.contains(relatedTarget as Node)) || relatedTarget === null ? H.method('focus') : H.ident
  ));

  private readonly handleEscapePress = ({code}: KeyboardEvent) => {
    if (code === 'Escape') {
      this.setExpanded(false);

      pipe(this.button, A.map(H.method('focus')));
    }
  };

  private readonly handleOutsideClick = ({target}: MouseEvent) => pipe(
    this.root, O.map((root) => !root.contains(target as Node) ? this.setExpanded(false) : {})
  );
}

export default Dropdown;