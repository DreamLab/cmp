import 'core-js/fn/array/reduce';
import 'core-js/fn/array/fill';
import 'core-js/fn/array/map';
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/filter';
import 'core-js/fn/set';
import 'core-js/fn/number/is-integer';
import 'core-js/es6/symbol';
import 'core-js/fn/string/repeat';
import {init} from './lib/init';
import log from "./lib/log";
import config from "./lib/config";
import { decodeConsentData, readConsentCookie } from "./lib/cookie/cookie";
import {fetchGlobalVendorList} from "./lib/vendor";

const TCF_CONFIG = '__tcfConfig';

function handleConsentResult(tcfApi, store = {}, vendorList, consentData = {}) {
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

	const tcfApiCall = (command) => {
		tcfApi(command, 2, () => log.debug(`${command} command was called`));
	};

	if (!created) {
		log.debug('No consent data found. Showing consent tool');
		config.autoDisplay && tcfApiCall('showConsentTool');
	} else if (!listVersion) {
		log.debug('Could not determine vendor list version. Not showing consent tool');
	} else if (vendorListVersion !== listVersion) {
		log.debug(`Consent found for version ${vendorListVersion}, but received vendor list version ${listVersion}. Showing consent tool`);
		config.autoDisplay && tcfApiCall('showConsentTool');
	} else if (consentPolicyVersion !== listPolicyVersion) {
		log.debug(`Consent found for policy ${consentPolicyVersion}, but received vendor list with policy ${consentPolicyVersion}. Showing consent tool`);
		config.autoDisplay && tcfApiCall('showConsentTool');
	} else {
		log.debug('Consent found. Not showing consent tool. Show footer when not all consents set to true');
		!isConsentToolShowing && config.autoDisplay && tcfApiCall('showFooter');
	}
}

function checkConsent(tcfApi, store) {
	if (!tcfApi) {
		log.error('CMP failed to load');
	}
	else if (!window.navigator.cookieEnabled) {
		log.warn('Cookies are disabled. Ignoring CMP consent check');
	}
	else {
		const resolve = (timeout, consentData = {}, vendorList) => {
			clearTimeout(timeout);
			handleConsentResult(tcfApi, store, vendorList, consentData);
		};

		const { getVendorList, getConsentData } = config;
		if (getVendorList) {
			getVendorList((err, vendorList) => {
				if (err) {
					log.error('Failed to get vendor list');
				} else {
					const timeout = setTimeout(() => {
						handleConsentResult(tcfApi, store, vendorList);
					}, 100);

					if (getConsentData) {
						getConsentData((err, data) => {
							if (err) {
								resolve(timeout);
							} else {
								try {
									const tcStringDecoded = decodeConsentData(data.consent);
									resolve(timeout, tcStringDecoded, vendorList);
								} catch (e) {
									resolve(timeout);
								}
							}
						});
					}
				}
			});
		} else {
			fetchGlobalVendorList().then((vendorList) => {
				const timeout = setTimeout(() => {
					handleConsentResult(tcfApi, store, vendorList);
				}, 100);

				readConsentCookie().then((cookie) => {
					if (cookie) {
						try {
							const tcStringDecoded = decodeConsentData(cookie);
							resolve(timeout, tcStringDecoded, vendorList);
						} catch (e) {
							resolve(timeout);
						}
					}
				});
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

	init(configUpdates).then((store) => checkConsent(window.__tcfapi, store));
}

start();
