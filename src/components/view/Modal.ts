import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

interface IModalView {
	content: HTMLElement;
}

export class Modal extends Component<IModalView> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		console.log({ 'events': events });

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	_toggleModal(state: boolean = true) {
		this.toggleClass(this.container, 'modal_active', state);
	}

	_handleEscape = (evt: KeyboardEvent) => {
		if (evt.key === 'Escape') {
			this.close();
		}
	};

	open() {
		this._toggleModal();
		document.addEventListener('keydown', this._handleEscape);
		this.toggleClass(this.container, 'modal_active', true);
		this.events.emit('modal:open');
	}

	close() {
		this._toggleModal(false);
		document.removeEventListener('keydown', this._handleEscape);
		this.toggleClass(this.container, 'modal_active', false);
		this.content = null;
		this.events.emit('modal:close');
	}

	render(data: IModalView): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}
}
