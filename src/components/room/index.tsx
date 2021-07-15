import { Component, h, Prop } from "@stencil/core"

@Component({
	tag: "smoothly-room",
})
export class SmoothlyRoom {
	@Prop() label?: string
	@Prop() icon?: string
	@Prop() path: string
	@Prop() to?: string
	@Prop({ reflect: true }) reactive?: true
	render() {
		return <slot></slot>
	}
}
