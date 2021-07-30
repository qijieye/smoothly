// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, Event, EventEmitter, h, Prop } from "@stencil/core"
import { Trigger } from "../../model"

@Component({
	tag: "smoothly-user-menu",
	styleUrl: "style.scss",
	scoped: true,
})
export class SmoothlyUserMenu {
	@Prop({ reflect: true }) isOpen = false
	@Prop() userName: string
	@Event() trigger: EventEmitter<Trigger>
	private close() {
		this.isOpen = false
	}
	private toggle() {
		this.isOpen = !this.isOpen
	}
	private logout() {
		this.trigger.emit({ name: "logout", value: undefined })
	}

	render() {
		return [
			<a onClick={e => this.toggle()} class={{ active: this.isOpen }}>
				<smoothly-icon name="reorder-three" size="medium"></smoothly-icon>
				<smoothly-icon name="person" size="medium"></smoothly-icon>
			</a>,
			<div class="background" onClick={() => this.close()} />,
			<div>
				<div>{this.userName}</div>
				<ul onClick={() => this.toggle()}>
					<slot name="small-screen" />
					<li onClick={() => this.logout()}>
						<span>Logout</span>
						<smoothly-icon name="log-out" size="medium"></smoothly-icon>
					</li>
				</ul>
			</div>,
		]
	}
}
