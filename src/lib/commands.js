import { TCModel, GVL, TCString } from "@iabtcf/core";
import config from "./config";
import { encodeVendorConsentData } from "./cookie/cookie";
const arrayFrom = require('core-js/library/fn/array/from');

const COOKIE_VERSION = 2;
const CMP_ID = 280;
const CMP_VERSION = 2;

const createCommands = (store) => {
	let vendorList;

	const getVendorList = (callback) => {
		if (vendorList) {
			callback(vendorList);
		} else if (store.vendorList && Object.keys(store.vendorList).length) {
			vendorList = JSON.parse(JSON.stringify(store.vendorList));
			callback(vendorList);
		} else {
			const {getVendorList} = config;

			if (getVendorList) {
				getVendorList((err, data) => {
					if (err) {
						callback({}, err)
					} else {
						vendorList = data;
						callback(vendorList)
					}
				})
			}
		}
	};

	const vectorToObject = (set) => {
		let obj = {};

		set.forEach((hasConsent, id) => {
			obj[id] = hasConsent
		});

		return obj;
	};

	const generateConsentStringV1 = (data = {}, callback) => {

		getVendorList((vendorList, err) => {
			if (err) {
				callback({}, false)
			}
			if (vendorList) {
				const {
					persistedConsentData,
				} = store;

				const allowedVendorIds = new Set(Object.keys(vendorList.vendors).map(v => parseInt(v, 10)));

				let selectedVendorIds = new Set();
				persistedConsentData.vendorConsents.forEach((hasConsent, id) => {
					if (hasConsent) {
						selectedVendorIds.add(id);
					}
				});

				let selectedPurposeIds = new Set();
				persistedConsentData.purposeConsents.forEach((hasConsent, id) => {
					if (hasConsent) {
						selectedPurposeIds.add(id);
					}
				});

				selectedVendorIds = data.selectedVendorIds ? data.selectedVendorIds : selectedVendorIds;
				selectedPurposeIds = data.selectedPurposeIds ? data.selectedPurposeIds : selectedPurposeIds;

				const consentData = {
					// ...persistedVendorConsentData,
					vendorList,
					...data,
					selectedVendorIds: new Set(arrayFrom(selectedVendorIds).filter(id => !allowedVendorIds.size || allowedVendorIds.has(id))),
					selectedPurposeIds: new Set(arrayFrom(selectedPurposeIds))
				};

				const valid = (data = {}) => [
					'cmpId', 'cmpVersion', 'consentLanguage', 'consentScreen', 'cookieVersion', 'created', 'lastUpdated',
					'maxVendorId', 'selectedPurposeIds', 'selectedVendorIds', 'vendorListVersion'
				].every(prop => data.hasOwnProperty(prop));

				callback(valid(consentData) ? encodeVendorConsentData(consentData) : undefined);
			}});
	};

	const getConsentObject = (callback, params) => {
		getVendorList((vendorList, err) => {
			if (err) {
				callback({}, false)
			}
			if (vendorList) {
				const {
					vendorListVersion: paramsVendorListVersion,
					...tcModelFields
				} = params;
				const {persistedConsentData} = store;
				const {vendors} = vendorList;
				const globalVendorsObject = {};

				for (let vendor of Object.values(vendors)) {
					if (!vendor.globalId) {
						continue;
					}

					globalVendorsObject[vendor.globalId] = {
						id: vendor.globalId,
						name: vendor.name,
						policyUrl: vendor.policyUrl,
						purposes: vendor.purposes,
						specialPurposes: vendor.specialPurposes,
						legIntPurposes: vendor.legIntPurposes,
						features: vendor.features,
						specialFeatures: vendor.specialFeatures
					}
				}

				vendorList.vendors = globalVendorsObject;
				vendorList.vendorListVersion = paramsVendorListVersion;

				const tcModel = new TCModel(new GVL(vendorList));
				tcModel.cookieVersion = COOKIE_VERSION;
				tcModel.cmpId = CMP_ID;
				tcModel.cmpVersion = CMP_VERSION;
				tcModel.created = persistedConsentData && persistedConsentData.created || new Date();
				tcModel.lastUpdated = persistedConsentData && persistedConsentData.lastUpdated || new Date();
				tcModel.vendorListVersion = tcModel.vendorListVersion_ = paramsVendorListVersion;
				tcModel.isServiceSpecific = true;
				tcModel.supportOOB = false;

				for (let key of Object.keys(tcModelFields)) {
					tcModel[key] && tcModel[key].set(params[key]);
				}

				const encoded = TCString.encode(tcModel);
				const decoded = TCString.decode(encoded);

				const {
					cmpId,
					cmpVersion,
					policyVersion: tcfPolicyVersion,
					supportOOB,
					vendorListVersion,
					isServiceSpecific,
					useNonStandardStacks,
					publisherCountryCode: publisherCC,
					purposeConsents,
					purposeLegitimateInterests,
					publisherConsents,
					publisherLegitimateInterests,
					vendorConsents,
					vendorLegitimateInterests,
					vendorsDisclosed,
					vendorsAllowed,
					specialFeatureOptIns,
					created,
					lastUpdated
				} = decoded;

				callback({
					tcString: encoded,
					cmpId,
					cmpVersion,
					tcfPolicyVersion,
					supportOOB,
					vendorListVersion,
					isServiceSpecific,
					useNonStandardStacks,
					publisherCC,
					created,
					lastUpdated,
					gdprApplies: config.gdprApplies,
					outOfBand: {
						allowedVendors: vectorToObject(vendorsAllowed),
						disclosedVendors: vectorToObject(vendorsDisclosed)
					},
					purpose: {
						consents: vectorToObject(purposeConsents),
						legitimateInterests: vectorToObject(purposeLegitimateInterests)
					},
					vendor: {
						consents: vectorToObject(vendorConsents),
						legitimateInterests: vectorToObject(vendorLegitimateInterests)
					},
					specialFeatureOptins: vectorToObject(specialFeatureOptIns),
					publisher: {
						consents: vectorToObject(publisherConsents),
						legitimateInterests: vectorToObject(publisherLegitimateInterests)
					}
				}, true);
			}
		})
	};

	const getConsentFieldsV1 = (callback, params) => {
		const data = store.getConsentFieldsObject();
		const now = new Date();

		generateConsentStringV1({
				created: now,
				lastUpdated: now,
				...data,
				...params
			}, (metadata) => {

			const consent = {
				metadata: metadata,
				gdprApplies: config.gdprApplies,
				hasGlobalScope: config.storeConsentGlobally,
				...data
			};

			callback(consent, true);
		})
	};

	return {
		getConsentObject,
		getConsentFieldsV1
	}
};

export default createCommands;
