/* eslint-disable react/jsx-no-bind */
import { h, render } from 'preact';
import { expect } from 'chai';
import style from './vendors.less';

import Vendors from './vendors';
import Vendor from './vendor';
import Label from "../../../label/label";
import {VENDOR_LIST} from "../../../../../test/constants";

describe('Vendors', () => {
	let scratch;

	beforeEach(() => {
		scratch = document.createElement('div');
	});

	it('should render the vendor list', () => {
		const vendors = render(<Vendors
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'Special Purpose 1'},
				{id: 2, name: 'Special Purpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'Special Feature 1'},
				{id: 2, name: 'Special Feature 2'},
			]}
		/>, scratch);

		const vendorRows = vendors.querySelectorAll(`.${style.vendorContent} tr`);
		expect(vendorRows.length).to.equal(4);
	});

	it('getActiveAttributesNameElements - empty arrays', () => {
		const purposes = VENDOR_LIST.purposes;
		const features = VENDOR_LIST.features;
		const purposeIds = [];
		const legIntPurposeIds = [];
		const featureIds = [];

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
		>
			<div/>
		</Vendors>, scratch);

		const purposesToRender = vendors.getActiveAttributesNameElements(Object.values(purposes), purposeIds, 'purposes.purpose');
		const legIntsToRender = vendors.getActiveAttributesNameElements(Object.values(purposes), legIntPurposeIds, 'purposes.purpose');
		const featuresToRender = vendors.getActiveAttributesNameElements(Object.values(features), featureIds, 'features.feature');

		expect(purposesToRender.length).to.equal(0);
		expect(legIntsToRender.length).to.equal(0);
		expect(featuresToRender.length).to.equal(0);
	});

	it('getActiveAttributesNameElements - one element per array', () => {
		const purposes = VENDOR_LIST.purposes;
		const features = VENDOR_LIST.features;
		const purposeIds = [1];
		const legIntPurposeIds = [2];
		const featureIds = [1];

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
		>
			<div/>
		</Vendors>, scratch);

		const purposesToRender = vendors.getActiveAttributesNameElements(Object.values(purposes), purposeIds, 'purposes.purpose');
		const legIntsToRender = vendors.getActiveAttributesNameElements(Object.values(purposes), legIntPurposeIds, 'purposes.purpose');
		const featuresToRender = vendors.getActiveAttributesNameElements(Object.values(features), featureIds, 'features.feature');

		expect(purposesToRender.length).to.equal(1);
		expect(legIntsToRender.length).to.equal(1);
		expect(featuresToRender.length).to.equal(1);
	});

	it('getActiveAttributesNameElements - many elements', () => {
		const purposes = VENDOR_LIST.purposes;
		const features = VENDOR_LIST.features;
		const purposeIds = [1,2,3];
		const legIntPurposeIds = [4,5];
		const featureIds = [1,2];

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
		>
			<div/>
		</Vendors>, scratch);

		const purposesToRender = vendors.getActiveAttributesNameElements(Object.values(purposes), purposeIds, 'purposes.purpose');
		const legIntsToRender = vendors.getActiveAttributesNameElements(Object.values(purposes), legIntPurposeIds, 'purposes.purpose');
		const featuresToRender = vendors.getActiveAttributesNameElements(Object.values(features), featureIds, 'features.feature');

		// 3 elements + 2 commas
		expect(purposesToRender.length).to.equal(5);
		// 2 elements + 1 comma
		expect(legIntsToRender.length).to.equal(3);
		// 1 element, no comma
		expect(featuresToRender.length).to.equal(3);
	});

	it('should render vendor with purposes, special purposes, legIntPurposes, features and special features', () => {
		const vendor = render(<Vendor
			name={'Vendor 1'}
			policyUrl={'www.example.com'}
			purposes={[<Label localizeKey={'purposes.title'}>Purpose 1</Label>]}
			legIntPurposes={[<Label localizeKey={'purposes.title'}>LegIntPurpose 1</Label>]}
			features={[<Label localizeKey={'features.title'}>Feature 1</Label>]}
			specialPurposes={[<Label localizeKey={'specialPurposes.title'}>specPurpose 1</Label>]}
			specialFeatures={[<Label localizeKey={'specialFeatures.title'}>specFeature 1</Label>]}
		/>, scratch);

		const vendorRows = vendor.querySelectorAll(`div`);
		const vendorDescriptionRecords = vendor.querySelectorAll(`div > span > span`);
		expect(vendorRows.length).to.equal(2);
		expect(vendorDescriptionRecords.length).to.equal(5);
	});

	it('should render vendor without features', () => {
		const vendor = render(<Vendor
			name={'Vendor 1'}
			policyUrl={'www.example.com'}
			purposes={[
				<Label localizeKey={'purposes.title'}>Purpose 1</Label>,
				<Label localizeKey={'purposes.title'}>Purpose 2</Label>
			]}
			legIntPurposes={[<Label localizeKey={'purposes.title'}>Purpose 3</Label>]}
			features={[]}
		/>, scratch);

		const vendorRows = vendor.querySelectorAll(`div`);
		const vendorDescriptionRecords = vendor.querySelectorAll(`div > span > span`);
		expect(vendorRows.length).to.equal(2);
		expect(vendorDescriptionRecords.length).to.equal(3);
	});

	it('should handle selecting a vendor', () => {
		const selectVendor = jest.fn();
		const initialVendorsRejection = jest.fn();

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			selectVendor={selectVendor}
			initialVendorsRejection={initialVendorsRejection}
		/>, scratch);

		vendors.handleMoreChoices();
		vendors.handleSelectVendor({dataId: 2, isSelected: true});
		expect(initialVendorsRejection.mock.calls.length).to.equal(1);
		expect(selectVendor.mock.calls[0][0]).to.equal(2);
		expect(selectVendor.mock.calls[0][1]).to.equal(true);
	});

	it('should handle accepting all vendors', () => {
		const selectVendors = jest.fn();
		const initialVendorsRejection = jest.fn();

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			selectVendors={selectVendors}
			initialVendorsRejection={initialVendorsRejection}
		/>, scratch);

		vendors.handleMoreChoices();
		vendors.handleAcceptAll();
		expect(initialVendorsRejection.mock.calls.length).to.equal(1);
		expect(selectVendors.mock.calls[0][0]).to.deep.equal([1, 2, 3, 4]);
		expect(selectVendors.mock.calls[0][1]).to.equal(true);
	});

	it('should handle accepting all vendors if some vendors are rejected', () => {
		const initialVendorsRejection = jest.fn();
		const selectVendors = jest.fn();

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			initialVendorsRejection={initialVendorsRejection}
			selectVendors={selectVendors}
		/>, scratch);

		vendors.handleMoreChoices();
		vendors.handleFullConsentChange({isSelected: true});
		expect(initialVendorsRejection.mock.calls.length).to.equal(1);
		expect(selectVendors.mock.calls[0][0]).to.deep.equal([1, 2, 3, 4]);
		expect(selectVendors.mock.calls[0][1]).to.equal(true);
	});

	it('should handle rejecting all vendors', () => {
		const initialVendorsRejection = jest.fn();
		const selectVendors = jest.fn();

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			initialVendorsRejection={initialVendorsRejection}
			selectVendors={selectVendors}
		/>, scratch);

		vendors.handleMoreChoices();
		vendors.handleRejectAll();
		expect(initialVendorsRejection.mock.calls.length).to.equal(1);
		expect(selectVendors.mock.calls[0][0]).to.deep.equal([1, 2, 3, 4]);
		expect(selectVendors.mock.calls[0][1]).to.equal(false);
	});

	it('should handle rejecting all vendors if some vendors are selected', () => {
		const initialVendorsRejection = jest.fn();
		const selectVendors = jest.fn();

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			initialVendorsRejection={initialVendorsRejection}
			selectVendors={selectVendors}
		/>, scratch);

		vendors.handleMoreChoices();
		vendors.handleFullConsentChange({isSelected: false});
		expect(initialVendorsRejection.mock.calls.length).to.equal(1);
		expect(selectVendors.mock.calls[0][0]).to.deep.equal([1, 2, 3, 4]);
		expect(selectVendors.mock.calls[0][1]).to.equal(false);
	});

	it('should return true if all vendors are accepted', () => {
		let vendors;

		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			selectedVendorIds={new Set([1, 2, 3, 4])}
			initialVendorsRejection={jest.fn()}
		/>, scratch);

		const result = vendors.isFullVendorsConsentChosen();
		expect(result).to.equal(true);
	});

	it('should return false if some vendors are rejected', () => {
		let vendors;

		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			selectedVendorIds={new Set([1])}
			initialVendorsRejection={jest.fn()}
		/>, scratch);

		const result = vendors.isFullVendorsConsentChosen();
		expect(result).to.equal(false);
	});

	it('should handle deselecting a legitimate interest', () => {
		const selectVendorLegitimateInterests = jest.fn();
		const initialVendorsRejection = jest.fn();

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'},
				{id: 2, name: 'Purpose 2'},
			]}
			features={[
				{id: 1, name: 'Feature 1'},
				{id: 2, name: 'Feature 2'},
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'},
				{id: 2, name: 'sPurpose 2'},
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'},
				{id: 2, name: 'sFeature 2'},
			]}
			selectVendorLegitimateInterests={selectVendorLegitimateInterests}
			initialVendorsRejection={initialVendorsRejection}

		/>, scratch);

		vendors.handleMoreChoices();
		vendors.handleLegitInterest({dataId: 2, isSelected: false});
		expect(selectVendorLegitimateInterests.mock.calls[0][0]).to.equal(2);
		expect(selectVendorLegitimateInterests.mock.calls[0][1]).to.equal(false);
	});

	it('should handle deselecting all vendors legitimate interest', () => {
		const selectVendorLegitimateInterests = jest.fn();
		const initialVendorsRejection = jest.fn();

		let vendors;
		render(<Vendors
			ref={ref => vendors = ref}
			vendors={[
				{id: 1, name: 'Vendor 1', purposes: [1], legIntPurposes: [2], features: [], specialPurposes: [1], specialFeatures: [1]},
				{id: 2, name: 'Vendor 2', purposes: [], legIntPurposes: [1], features: [], specialPurposes: [], specialFeatures: [1]},
				{id: 3, name: 'Vendor 3', purposes: [1], legIntPurposes: [2], features: [1], specialPurposes: [1], specialFeatures: []},
				{id: 4, name: 'Vendor 4', purposes: [2], legIntPurposes: [1], features: [1, 2], specialPurposes: [], specialFeatures: []}
			]}
			purposes={[
				{id: 1, name: 'Purpose 1'}
			]}
			features={[
				{id: 1, name: 'Feature 1'}
			]}
			specialPurposes={[
				{id: 1, name: 'sPurpose 1'}
			]}
			specialFeatures={[
				{id: 1, name: 'sFeature 1'}
			]}
			selectVendorLegitimateInterests={selectVendorLegitimateInterests}
			initialVendorsRejection={initialVendorsRejection}

		/>, scratch);

		vendors.handleMoreChoices();
		vendors.handleFullLegIntChange({isSelected: false});
		expect(selectVendorLegitimateInterests.mock.calls.length).to.equal(4);
		expect(selectVendorLegitimateInterests.mock.calls[0][1]).to.equal(false);
		expect(selectVendorLegitimateInterests.mock.calls[1][1]).to.equal(false);
	});
});
