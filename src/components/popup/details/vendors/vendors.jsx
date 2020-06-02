import { h, Component } from 'preact';
import style from './vendors.less';
import Switch from '../../../switch/switch';
import ExternalLinkIcon from "../../../externallinkicon/externallinkicon";
import Label from "../../../label/label";
import Vendor from './vendor'

class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'vendors'
	};
}

export default class Vendors extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editingConsents: false
		};
	}

	static defaultProps = {
		vendors: [],
		purposes: [],
		features: [],
		selectedVendorIds: new Set(),
		selectVendor: () => {}
	};

	handleAcceptAll = () => {
		const {vendors, selectVendors} = this.props;
		selectVendors(vendors.map(({id}) => id), true)
	};

	handleRejectAll = () => {
		const {vendors, selectVendors} = this.props;
		selectVendors(vendors.map(({id}) => id), false);
	};

	handleSelectVendor = ({ dataId, isSelected }) => {
		this.props.selectVendor(dataId, isSelected);
	};

	handleLegitInterest = ({ dataId, isSelected }) => {
		this.props.selectVendorLegitimateInterests(dataId, isSelected);
	};

	handleMoreChoices = () => {
		const {consentCreated, initialVendorsRejection} = this.props;
		if (!consentCreated) {
			initialVendorsRejection();
		}

		this.setState({
			editingConsents: true
		});
	};

	isFullVendorsConsentChosen = () => {
		const {vendors, selectedVendorIds} = this.props;
		const isSelected = ({id}) => selectedVendorIds.has(id);
		return vendors.every(isSelected);
	};

	handleFullConsentChange = ({isSelected}) => {
		isSelected ? this.handleAcceptAll() : this.handleRejectAll();
	};

	isFullLegitimateInterestChosen = () => {
		const {vendorsWithLegIntsIds, selectedVendorsLegitimateInterestsIds} = this.props;
		const isSelected = (el) => selectedVendorsLegitimateInterestsIds.has(el);
		return vendorsWithLegIntsIds.every(isSelected);
	};

	handleFullLegIntChange = ({isSelected}) => {
		const {vendors, selectVendorLegitimateInterests} = this.props;
		vendors.forEach(el => selectVendorLegitimateInterests(el.id, isSelected));
	};

	getActiveAttributesNameElements = (setOfAttributes, idsOfActiveAttributes, translationPrefix = '') => {
		const activeAttributes = setOfAttributes
			.filter(attribute => idsOfActiveAttributes.indexOf(attribute['id']) !== -1)
			.map(attribute => <Label localizeKey={`${translationPrefix}${attribute['id']}.title`}>{attribute['name']}</Label>);

		return activeAttributes.length > 1 ? activeAttributes.reduce((prev, curr) => [...prev, ', ', curr]) : activeAttributes;
	};

	render(props, state) {

		const {
			vendors,
			selectedVendorIds,
			selectedVendorsLegitimateInterestsIds,
			purposes,
			features,
			specialPurposes,
			specialFeatures
		} = props;
		const { editingConsents } = this.state;

		let isLegIntSwitchVisible = vendors.some(el => !!el.legIntPurposes.length);

		return (
			<div class={style.vendors}>
				<div class={style.header}>
					<div class={style.title}>
						<LocalLabel localizeKey='title'>Our partners</LocalLabel>
					</div>
				</div>
				<div class={style.description}>
					<LocalLabel localizeKey='description'>
						Help us provide you with a better online experience! Our partners set cookies and collect information from your browser across the web to provide you with website content, deliver relevant advertising and understand web audiences.
					</LocalLabel>
						{!editingConsents &&
						<div>
							<a onClick={this.handleMoreChoices}>
								<LocalLabel localizeKey='moreChoices'>Make More Choices</LocalLabel>
							</a>
						</div>
						}
				</div>
				<div class={style.vendorHeader}>
					<table class={style.vendorList}>
						<thead>
						<tr>
							<th><LocalLabel localizeKey='company'>Company</LocalLabel></th>
							{editingConsents &&
							<span class={style.vendorCenterSmall}>
								{isLegIntSwitchVisible &&
									<th><LocalLabel localizeKey='legitimateInterest'>LegInt</LocalLabel>
									<Switch
										isSelected={this.isFullLegitimateInterestChosen()}
										onClick={this.handleFullLegIntChange}
									/></th>
								}
							<th>
								<LocalLabel localizeKey='offOn'>Allow</LocalLabel>
								<Switch
									isSelected={this.isFullVendorsConsentChosen()}
									onClick={this.handleFullConsentChange}
								/>
							</th>
							</span>
							}
						</tr>
						</thead>
					</table>
				</div>
				<div class={style.vendorContent}>
					<table class={style.vendorList}>
						<tbody>
						{vendors.map(({ id, name, policyUrl, purposes: purposeIds=[], legIntPurposes=[],
										 features: featureIds=[], specialPurposes: specialPurposeIds=[],
										  specialFeatures: specialFeatureIds=[] }, index) => (
							<tr key={id} class={index % 2 === 1 ? style.even : ''}>
								<td>
									<div className={style.vendorName}>
										{name}
										{policyUrl &&
										<a href={policyUrl} className={style.policy} target='_blank'><ExternalLinkIcon/></a>}
									</div>
									<div className={style.vendorDescription}>
										{purposes && !!purposes.length &&
										<span>
											<b><LocalLabel localizeKey='purposes'>Purposes</LocalLabel></b>{': '}
																	{purposes}{'. '}
										</span>}
																{legIntPurposes && !!legIntPurposes.length &&
																<span>
											<b><LocalLabel
												localizeKey='legitimateInterestPurposes'>Legitimate interest purposes</LocalLabel></b>{': '}
																	{legIntPurposes}{'. '}
										</span>}
																{specialPurposes && !!specialPurposes.length &&
																<span>
											<b><LocalLabel localizeKey='specialPurposes'>Special purposes</LocalLabel></b>{': '}
																	{specialPurposes}{'. '}
										</span>}
																{features && !!features.length &&
																<span>
											<b><LocalLabel localizeKey='features'>Features</LocalLabel></b>{': '}
																	{features}{'. '}
										</span>}
																{specialFeatures && !!specialFeatures.length &&
																<span>
											<b><LocalLabel localizeKey='specialFeatures'>Special features</LocalLabel></b>{': '}
																	{specialFeatures}{'. '}
										</span>}
									</div>
								</td>
								{editingConsents && legIntPurposes.length &&
									<td class={style.vendorCenterSmall}>
										<LocalLabel localizeKey='legitimateInterest'>LegInt</LocalLabel>
										<Switch
											dataId={id}
											isSelected={selectedVendorsLegitimateInterestsIds.has(id)}
											onClick={this.handleLegitInterest}
										/>
									</td> || <td/>}
								{editingConsents &&
									<td class={style.vendorCenterSmall}>
										<LocalLabel localizeKey='acceptButton'>Consent</LocalLabel>
										<Switch
											dataId={id}
											isSelected={selectedVendorIds.has(id)}
											onClick={this.handleSelectVendor}
										/>
									</td>
								}
							</tr>
						))}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}
