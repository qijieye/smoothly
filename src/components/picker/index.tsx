import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch } from "@stencil/core"
import { OptionType } from "../../model"

@Component({
	tag: "smoothly-picker",
	styleUrl: "style.scss",
	shadow: true,
})
export class SmoothlyPicker {
	private inputElement: HTMLInputElement
	private keepFocusOnReRender = false
	private menuElement: HTMLSmoothlyMenuOptionsElement
	@Element() element: HTMLElement
	@State() isOpen: boolean
	@Prop() maxMenuHeight: "inherit"
	@Prop() maxHeight: string
	@Prop({ mutable: true }) emptyMenuLabel = "No Options"
	@Prop({ reflect: true }) multiple = false
	@Prop() optionStyle: any
	@Prop({ reflect: true }) options: OptionType[] = []
	@Prop({ reflect: true }) labelSetting: "hide" | "default"
	@Prop({ reflect: true }) label: string
	@Prop({ mutable: true }) selections: OptionType[] = []
	@Prop({ mutable: true }) selectNoneName = "Select None"
	@Prop({ mutable: true }) selectionName = "items selected"
	@Event() menuClose: EventEmitter<OptionType[]>

	@Watch("selections")
	@Watch("isOpen")
	isOpenChangeHander() {
		if (this.isOpen == false) {
			this.menuClose.emit(this.selections)
		}
	}
	componentDidRender() {
		this.filterOptions()
		if (this.keepFocusOnReRender) {
			this.inputElement.focus()
			this.keepFocusOnReRender = false
		}
	}
	@Listen("optionSelect")
	optionSelectHander(event: CustomEvent<OptionType>) {
		this.toggle(event.detail)
		event.stopPropagation()
	}
	toggle(option: OptionType) {
		option.value == "select-none"
			? this.toggleAll()
			: this.selections.map(s => s.value).includes(option.value)
			? this.unselect(option)
			: this.select(option)
	}
	toggleAll() {
		this.selections = this.selections.length == this.options?.length ? [] : this.options
		this.inputElement.focus()
		this.keepFocusOnReRender = true
	}
	unselect(selection: OptionType) {
		const index = this.selections.map(selection => selection.value).indexOf(selection.value)
		if (index != -1) {
			this.selections = [
				...this.selections.slice(0, index),
				...this.selections.slice(index + 1, this.selections.length),
			]
			this.keepFocusOnReRender = true
		}
	}
	select(selection: OptionType) {
		const isNewSelection = this.selections.reduce((acc, current) => acc && current.value != selection.value, true)
		if (isNewSelection)
			this.selections = this.multiple ? [...this.selections, selection] : [selection]
		this.inputElement.value = ""
		this.filterOptions()
		this.keepFocusOnReRender = true
		this.isOpen = this.multiple
	}
	toggleHighlighted() {
		this.menuElement?.getHighlighted().then((result: OptionType | undefined) => {
			result && this.toggle(result)
		})
	}
	highlightDefault() {
		this.filterOptions()
		this.menuElement?.setHighlight(this.multiple || this.selections.length == 0 ? 0 : this.selections[0].value)
	}
	filterOptions() {
		this.menuElement?.filterOptions(this.inputElement.value, [])
	}
	onInput(event: UIEvent) {
		this.isOpen = this.inputElement.value != "" ? true : this.isOpen
		this.highlightDefault()
	}
	onKeyDown(event: KeyboardEvent) {
		if (event.key == "ArrowUp" || event.key == "ArrowDown") {
			this.menuElement?.moveHighlight(event.key == "ArrowUp" ? -1 : 1)
			event.preventDefault()
		} else if (event.key == "Enter" && this.isOpen)
			this.toggleHighlighted()
		else if (event.key == "Escape") {
			this.inputElement.value = ""
			this.isOpen = false
			this.filterOptions()
		} else if (event.key == " " && this.inputElement.value == "") {
			event.preventDefault()
			this.isOpen = true
			this.filterOptions()
		}
	}
	onClick() {
		this.isOpen = !this.isOpen
		this.inputElement.focus()
		this.highlightDefault()
		this.filterOptions()
	}
	onBlur() {
		this.inputElement.value = ""
		this.isOpen = false
		this.filterOptions()
	}
	getCheckHtml(checked: boolean): HTMLElement {
		return checked ? (
			<smoothly-icon name="checkbox" size="small"></smoothly-icon>
		) : (
			<smoothly-icon name="square-outline" size="small"></smoothly-icon>
		)
	}

	render() {
		const cssVariables = {
			"--max-height": this.maxHeight ?? "inherit",
			"--label-display": this.labelSetting == "hide" ? "none" : "absolute",
		}
		this.options?.forEach(o => {
			o.left = this.getCheckHtml(this.selections.map(s => s.value).includes(o.value))
		})
		const options = [
			{
				value: "select-none",
				name: this.selectNoneName,
				left: this.getCheckHtml(this.selections.length == this.options?.length),
				divider: true,
			},
			...(this.options ?? []),
		]
		return (
			<Host
				style={cssVariables}
				has-selection={this.selections.length > 0}
				is-open={this.isOpen ? "" : undefined}
				onMouseDown={(e: MouseEvent) => e.preventDefault()}
				onClick={() => this.onClick()}>
				<div>
					<smoothly-icon class="search" name="search-outline" size="tiny"></smoothly-icon>
					<label>{this.label}</label>
					<input
						type="text"
						ref={(el: HTMLInputElement) => (this.inputElement = el ? el : this.inputElement)}
						onFocus={() => this.highlightDefault()}
						onBlur={() => this.onBlur()}
						placeholder={
							this.selections.length > 3
								? this.selections.length.toString() + " " + this.selectionName
								: this.selections.map(selection => selection.name).join(", ")
						}
						onKeyDown={e => this.onKeyDown(e)}
						onInput={(e: UIEvent) => this.onInput(e)}></input>
					<smoothly-icon class="down" name="chevron-down" size="tiny"></smoothly-icon>
					<smoothly-icon class="up" name="chevron-up" size="tiny"></smoothly-icon>
				</div>
				<smoothly-menu-options
					style={{ width: "100%" }}
					optionStyle={{ ...this.optionStyle }}
					order={false}
					emptyMenuLabel={this.emptyMenuLabel}
					max-menu-height={this.maxMenuHeight}
					ref={(el: HTMLSmoothlyMenuOptionsElement) => (this.menuElement = el ?? this.menuElement)}
					onClick={e => e.stopPropagation()}
					resetHighlightOnOptionsChange={false}
					options={options}></smoothly-menu-options>
			</Host>
		)
	}
}
