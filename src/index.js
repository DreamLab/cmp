import 'core-js/fn/array/reduce';
import 'core-js/fn/array/fill';
import 'core-js/fn/array/map';
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/filter';
import 'core-js/fn/set';
import {init} from './lib/init';
import log from "./lib/log";
import config from "./lib/config";
import { decodeConsentData } from "./lib/cookie/cookie";

const TCF_CONFIG = '__tcfConfig';

function handleConsentResult(cmp, store = {}, vendorList, consentData = {}) {
	const { isConsentToolShowing } = store;

	const {
		vendorListVersion: listVersion,
		tcfPolicyVersion: listPolicyVersion = 1
	} = vendorList;

	const {
		created,
		vendorListVersion,
		policyVersion: consentPolicyVersion = 1
	} = consentData;

	if (!created) {
		log.debug('No consent data found. Showing consent tool');
		config.autoDisplay && cmp('showConsentTool');
	} else if (!listVersion) {
		log.debug('Could not determine vendor list version. Not showing consent tool');
	} else if (vendorListVersion !== listVersion) {
		log.debug(`Consent found for version ${vendorListVersion}, but received vendor list version ${listVersion}. Showing consent tool`);
		config.autoDisplay && cmp('showConsentTool');
	} else if (consentPolicyVersion !== listPolicyVersion) {
		log.debug(`Consent found for policy ${consentPolicyVersion}, but received vendor list with policy ${consentPolicyVersion}. Showing consent tool`);
		config.autoDisplay && cmp('showConsentTool');
	} else {
		log.debug('Consent found. Not showing consent tool. Show footer when not all consents set to true');
		!isConsentToolShowing && config.autoDisplay && cmp('showFooter');
	}
}

function checkConsent(cmp, store) {
	if (!cmp) {
		log.error('CMP failed to load');
	}
	else if (!window.navigator.cookieEnabled) {
		log.warn('Cookies are disabled. Ignoring CMP consent check');
	}
	else {
		const { getVendorList, getTCData } = config;

		if (getVendorList) {
			getVendorList((vendorList, err) => {
				if (err) {
					log.error('Failed to get vendor list');
				} else {
					const timeout = setTimeout(() => {
						console.log("TIMEOUT")
						handleConsentResult(cmp, store, vendorList);
					}, 100);
					window.__tcfapi('getTCData', 2, (tcData, success) => {
						if (success) {
							console.log("GET TC DATA");
							let tcStringDecoded = decodeConsentData(tcData.tcString);
							clearTimeout(timeout);
							handleConsentResult(cmp, store, vendorList, tcStringDecoded);
						}
					}, undefined, true);
					// if (getTCData) {
					// 	getTCData((tcData, success) => {
					// 		if (success) {
					// 			let tcStringDecoded = decodeConsentData(tcData.tcString);
					// 			clearTimeout(timeout);
					// 			handleConsentResult(cmp, store, vendorList, tcStringDecoded);
					// 		}
					// 	});
					// }
				}
			});
		}
	}
}

function start() {
	// Preserve any config options already set
	const config  = window[TCF_CONFIG] || {};

	const configUpdates = {
		globalConsentLocation: 'https://rasp.mgr.consensu.org/portal.html',
		...config
	};

	init(configUpdates).then((store) => checkConsent(window.__cmp, store));
}

start();
