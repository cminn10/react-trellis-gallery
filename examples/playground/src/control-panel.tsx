import type { ReactNode } from 'react'

import type {
	GoToItemResult,
	LayoutResult,
	PaginationAlign,
	PaginationPosition,
	TrellisMode,
} from 'react-trellis-gallery'

import type {
	LayoutType,
	PaginationRenderMode,
	PlaygroundControls,
	PlaygroundSetters,
	SearchField,
	SearchOperator,
} from './use-playground-state'

interface ControlPanelProps {
	controls: PlaygroundControls
	setters: PlaygroundSetters
	layoutInfo: LayoutResult
	indicatorEnabled: boolean
	onIndicatorChange: (next: boolean) => void
	onOpenItem1: () => void
	onOpenFirst3: () => void
	onCloseAll: () => void
	onGoToItem: (field: SearchField, operator: SearchOperator, value: string, duration: number) => void
	onClearHighlights: () => void
	searchResult: GoToItemResult | null
}

interface SectionProps {
	title: string
	children: ReactNode
}

function Section({ title, children }: SectionProps) {
	return (
		<fieldset className="panel-section">
			<legend>{title}</legend>
			{children}
		</fieldset>
	)
}

interface NumberFieldProps {
	label: string
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	step?: number
}

function NumberField({ label, value, onChange, min, max, step }: NumberFieldProps) {
	return (
		<label className="control-row">
			<span>{label}</span>
			<input
				type="number"
				value={value}
				min={min}
				max={max}
				step={step}
				onChange={(event) => {
					const next = Number(event.target.value)
					onChange(Number.isFinite(next) ? next : 0)
				}}
			/>
		</label>
	)
}

interface TextFieldProps {
	label: string
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
	return (
		<label className="control-row">
			<span>{label}</span>
			<input
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={(event) => {
					onChange(event.target.value)
				}}
			/>
		</label>
	)
}

interface CheckboxFieldProps {
	label: string
	checked: boolean
	onChange: (value: boolean) => void
	disabled?: boolean
}

function CheckboxField({ label, checked, onChange, disabled = false }: CheckboxFieldProps) {
	return (
		<label className={`control-row control-row-checkbox${disabled ? ' is-disabled' : ''}`}>
			<span>{label}</span>
			<input
				className="control-checkbox"
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(event) => {
					onChange(event.target.checked)
				}}
			/>
		</label>
	)
}

interface SelectOption<T extends string> {
	value: T
	label: string
}

interface SelectFieldProps<T extends string> {
	label: string
	value: T
	options: SelectOption<T>[]
	onChange: (value: T) => void
}

function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
	return (
		<label className="control-row">
			<span>{label}</span>
			<select
				value={value}
				onChange={(event) => {
					onChange(event.target.value as T)
				}}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	)
}

const modeOptions: SelectOption<TrellisMode>[] = [
	{ value: 'pagination', label: 'Pagination' },
	{ value: 'scroll', label: 'Scroll' },
]

const layoutTypeOptions: SelectOption<LayoutType>[] = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'manual', label: 'Manual' },
]

const paginationRenderModeOptions: SelectOption<PaginationRenderMode>[] = [
	{ value: 'default', label: 'Default (in-container)' },
	{ value: 'custom', label: 'Custom (raw render)' },
	{ value: 'hidden', label: 'Hidden (external only)' },
]

const paginationPositionOptions: SelectOption<PaginationPosition>[] = [
	{ value: 'top', label: 'Top' },
	{ value: 'bottom', label: 'Bottom' },
]

const paginationAlignOptions: SelectOption<PaginationAlign>[] = [
	{ value: 'start', label: 'Left' },
	{ value: 'center', label: 'Center' },
	{ value: 'end', label: 'Right' },
]

const searchFieldOptions: SelectOption<SearchField>[] = [
	{ value: 'label', label: 'Label' },
	{ value: 'id', label: 'ID' },
	{ value: 'description', label: 'Description' },
	{ value: 'category', label: 'Category' },
	{ value: 'createdAt', label: 'Created At' },
]

const stringOperatorOptions: SelectOption<SearchOperator>[] = [
	{ value: 'contains', label: 'Contains' },
	{ value: 'equals', label: 'Equals' },
	{ value: 'startsWith', label: 'Starts with' },
]

const numberOperatorOptions: SelectOption<SearchOperator>[] = [
	{ value: 'eq', label: '=' },
	{ value: 'gt', label: '>' },
	{ value: 'lt', label: '<' },
	{ value: 'gte', label: '>=' },
	{ value: 'lte', label: '<=' },
]

const dateOperatorOptions: SelectOption<SearchOperator>[] = [
	{ value: 'before', label: 'Before' },
	{ value: 'after', label: 'After' },
	{ value: 'on', label: 'On' },
]

export function ControlPanel({
	controls,
	setters,
	layoutInfo,
	indicatorEnabled,
	onIndicatorChange,
	onOpenItem1,
	onOpenFirst3,
	onCloseAll,
	onGoToItem,
	onClearHighlights,
	searchResult,
}: ControlPanelProps) {
	const hasExternalPages = layoutInfo.totalPages > 0
	const externalPageDisplay = hasExternalPages ? controls.externalPage + 1 : 0
	const externalOnly = controls.paginationRenderMode === 'hidden'
	const searchOperatorOptions =
		controls.searchField === 'id'
			? numberOperatorOptions
			: controls.searchField === 'createdAt'
				? dateOperatorOptions
				: stringOperatorOptions

	return (
		<aside className="control-panel">
			<h2>TrellisGallery Playground</h2>
			<p className="panel-description">Tune layout, pagination, and container sizing with a stone-inspired UI.</p>

			<Section title="Grid Controls">
				<NumberField
					label="Item count"
					value={controls.itemCount}
					onChange={setters.setItemCount}
					min={0}
					max={10000}
					step={1}
				/>
				<SelectField label="Mode" value={controls.mode} options={modeOptions} onChange={setters.setMode} />
				<SelectField
					label="Layout type"
					value={controls.layoutType}
					options={layoutTypeOptions}
					onChange={setters.setLayoutType}
				/>

				{controls.layoutType === 'auto' ? (
					<>
						<NumberField
							label="Min item width"
							value={controls.minItemWidth}
							onChange={setters.setMinItemWidth}
							min={1}
							max={1200}
							step={10}
						/>
						<NumberField
							label="Min item height"
							value={controls.minItemHeight}
							onChange={setters.setMinItemHeight}
							min={1}
							max={1200}
							step={10}
						/>
					</>
				) : (
					<>
						<NumberField label="Rows" value={controls.rows} onChange={setters.setRows} min={1} max={100} step={1} />
						<NumberField label="Cols" value={controls.cols} onChange={setters.setCols} min={1} max={100} step={1} />
					</>
				)}

				<NumberField label="Gap" value={controls.gap} onChange={setters.setGap} min={0} max={32} step={1} />
			</Section>

			{controls.mode === 'pagination' ? (
				<Section title="Pagination Controls">
					<SelectField
						label="Render mode"
						value={controls.paginationRenderMode}
						options={paginationRenderModeOptions}
						onChange={setters.setPaginationRenderMode}
					/>

					{controls.paginationRenderMode === 'default' ? (
						<>
							<SelectField
								label="Position"
								value={controls.paginationPosition}
								options={paginationPositionOptions}
								onChange={setters.setPaginationPosition}
							/>
							<SelectField
								label="Align"
								value={controls.paginationAlign}
								options={paginationAlignOptions}
								onChange={setters.setPaginationAlign}
							/>
							<CheckboxField
								label="Draggable"
								checked={controls.paginationDraggable}
								onChange={setters.setPaginationDraggable}
							/>
							<TextField
								label="Label"
								value={controls.paginationLabel}
								placeholder="Optional (e.g. Split)"
								onChange={setters.setPaginationLabel}
							/>
						</>
					) : null}

					<CheckboxField
						label="External control"
						checked={controls.externalControl}
						disabled={externalOnly}
						onChange={setters.setExternalControl}
					/>

					{controls.externalControl ? (
						<div className="external-pagination-row">
							<div className="external-pagination-controls">
								<button
									className="external-nav-button"
									type="button"
									disabled={!hasExternalPages || controls.externalPage <= 0}
									onClick={() => {
										setters.setExternalPage(controls.externalPage - 1)
									}}
								>
									Prev
								</button>
								<input
									className="external-page-input"
									type="number"
									value={externalPageDisplay}
									min={hasExternalPages ? 1 : 0}
									max={hasExternalPages ? layoutInfo.totalPages : 0}
									onChange={(event) => {
										const next = Number(event.target.value)
										setters.setExternalPage(Number.isFinite(next) ? next - 1 : 0)
									}}
								/>
								<span className="external-page-total">{`/ ${layoutInfo.totalPages}`}</span>
								<button
									className="external-nav-button"
									type="button"
									disabled={!hasExternalPages || controls.externalPage >= layoutInfo.totalPages - 1}
									onClick={() => {
										setters.setExternalPage(controls.externalPage + 1)
									}}
								>
									Next
								</button>
							</div>
						</div>
					) : null}
				</Section>
			) : null}

			<Section title="Panel Control">
				<div className="panel-control-actions">
					<button className="external-nav-button panel-action-button" type="button" onClick={onOpenItem1}>
						Open Item 1
					</button>
					<button className="external-nav-button panel-action-button" type="button" onClick={onOpenFirst3}>
						Open First 3
					</button>
					<button className="external-nav-button panel-action-button" type="button" onClick={onCloseAll}>
						Close All
					</button>
				</div>
				<CheckboxField label="Indicator" checked={indicatorEnabled} onChange={onIndicatorChange} />
			</Section>

			<Section title="Go To Item">
				<label className="control-row">
					<span>Highlight color</span>
					<input
						type="color"
						value={controls.highlightColor}
						onChange={(event) => {
							setters.setHighlightColor(event.target.value)
						}}
					/>
				</label>
				<SelectField
					label="Field"
					value={controls.searchField}
					options={searchFieldOptions}
					onChange={(nextField) => {
						setters.setSearchField(nextField)
						if (nextField === 'id') {
							setters.setSearchOperator('eq')
							return
						}
						if (nextField === 'createdAt') {
							setters.setSearchOperator('on')
							return
						}
						setters.setSearchOperator('contains')
					}}
				/>
				<SelectField
					label="Operator"
					value={controls.searchOperator}
					options={searchOperatorOptions}
					onChange={setters.setSearchOperator}
				/>
				<TextField
					label="Value"
					value={controls.searchValue}
					placeholder={controls.searchField === 'createdAt' ? 'YYYY-MM-DD' : 'Search value'}
					onChange={setters.setSearchValue}
				/>
				<NumberField
					label="Duration (ms)"
					value={controls.searchDuration}
					min={0}
					max={60000}
					step={100}
					onChange={setters.setSearchDuration}
				/>
				<div className="panel-control-actions">
					<button
						className="external-nav-button panel-action-button"
						type="button"
						onClick={() => {
							onGoToItem(controls.searchField, controls.searchOperator, controls.searchValue, controls.searchDuration)
						}}
					>
						Go
					</button>
					<button className="external-nav-button panel-action-button" type="button" onClick={onClearHighlights}>
						Clear
					</button>
				</div>
				{searchResult ? (
					<div className="info-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
						<strong>{searchResult.found ? `${searchResult.matchCount} matches` : 'No matches'}</strong>
						<span>{`Page: ${searchResult.page + 1}`}</span>
						<span>{`Target index: ${searchResult.targetIndex}`}</span>
					</div>
				) : null}
			</Section>

			<Section title="Container">
				<NumberField
					label="Width"
					value={controls.containerWidth}
					onChange={setters.setContainerWidth}
					min={100}
					max={2000}
					step={10}
				/>
				<NumberField
					label="Height"
					value={controls.containerHeight}
					onChange={setters.setContainerHeight}
					min={100}
					max={1500}
					step={10}
				/>
			</Section>

			<Section title="Layout Info">
				<div className="info-row">
					<span>Grid</span>
					<strong>
						{layoutInfo.rows} x {layoutInfo.cols}
					</strong>
				</div>
				<div className="info-row">
					<span>Cell</span>
					<strong>
						{layoutInfo.cellWidth.toFixed(0)} x {layoutInfo.cellHeight.toFixed(0)}
					</strong>
				</div>
				<div className="info-row">
					<span>Items/page</span>
					<strong>{layoutInfo.itemsPerPage}</strong>
				</div>
				<div className="info-row">
					<span>Total pages</span>
					<strong>{layoutInfo.totalPages}</strong>
				</div>
			</Section>
		</aside>
	)
}
