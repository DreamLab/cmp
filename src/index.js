import 'core-js/fn/array/reduce';
import 'core-js/fn/array/fill';
import 'core-js/fn/array/map';
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/filter';
import 'core-js/fn/array/includes';
import 'core-js/fn/object/values';
import 'core-js/fn/map';
import 'core-js/fn/set';
import 'core-js/fn/number/is-integer';
import 'core-js/fn/symbol';
import 'core-js/fn/string/repeat';
import { init as initializeStore } from './lib/init';
import log from "./lib/log";
import config from "./lib/config";
import { decodeConsentData, readConsentCookie, applyDecodeFix } from "./lib/cookie/cookie";
import {fetchGlobalVendorList} from "./lib/vendor";
import { fetchTranslation } from './lib/translations'
import Promise from "promise-polyfill";

const TCF_CONFIG = '__tcfConfig';

const handleConsentResult = (...args) => {
	if (args.length < 2 || !config.autoDisplay) {
		return { display: false };
	}

	const [vendorList = {}, consentData = {}] = args;

	const {
		vendorListVersion: listVersion,
		tcfPolicyVersion: listPolicyVersion = 1
	} = vendorList;

	const {
		created,
		vendorListVersion,
		policyVersion: consentPolicyVersion = 1
	} = consentData;

	let displayOptions;

	if (!created) {
		log.debug('No consent data found. Showing consent tool');
		displayOptions = {display: true, command: 'showConsentTool'};
	} else if (!listVersion) {
		log.debug('Could not determine vendor list version. Not showing consent tool');
		displayOptions = { display: false };
	} else if (vendorListVersion !== listVersion) {
		log.debug(`Consent found for version ${vendorListVersion}, but received vendor list version ${listVersion}. Showing consent tool`);
		displayOptions = {display: true, command: 'showConsentTool'};
	} else if (consentPolicyVersion !== listPolicyVersion) {
		log.debug(`Consent found for policy ${consentPolicyVersion}, but received vendor list with policy ${consentPolicyVersion}. Showing consent tool`);
		displayOptions = {display: true, command: 'showConsentTool'};
	} else {
		log.debug('Consent found. Not showing consent tool. Show footer when not all consents set to true');
		displayOptions = {display: false, command: 'showFooter'};
	}

	return displayOptions;
};


const shouldDisplay = () => {
	const a = fetchTranslation().then((json) => console.log(json))

	return new Promise((resolve) => {
		if (!window.navigator.cookieEnabled) {
			const msg = 'Cookies are disabled. Ignoring CMP consent check';
			log.warn(msg);
			const result = handleConsentResult();
			resolve(result);
		} else {
			const finish = (timeout, vendorList, consentData, translation ) => {
				clearTimeout(timeout);
				const result = handleConsentResult(vendorList, consentData);
				result.translation = translation
				resolve(result);
			};

			const { getVendorList, getConsentData, getConsentDataTimeout } = config;
			console.log(config);
			//Mock
			const tr = {
				"version": 1234,
				"id": 1,
				"network": "1234567",
				"pattern": "network/lang/id/version",
				"languages": ["pl-pl", "en-en", "de-de"]
			}
			let translation;
			if (getVendorList) {
				// dodatkowy klucz "translation" do tłumaczcenia
				getVendorList((err, vendorList) => {
					if (err) {
						log.error('Failed to get vendor list');
						const result = handleConsentResult();
						resolve(result);
					} else {
						const timeout = setTimeout(() => {
							resolve({ display: false });
						}, getConsentDataTimeout);
						// tutaj zapiąć fetchTranslation()
						translation = fetchTranslation(tr)
							.then(result => {
								translation = result
								if (getConsentData) {
									getConsentData((err, data) => {
										if (err) {
											finish(timeout, vendorList);
										} else {
											try {
												const tcStringDecoded = decodeConsentData(data.consent);
												finish(timeout, vendorList, tcStringDecoded, translation);
											} catch (e) {
												finish(timeout, vendorList);
											}
										}
									});
								}
							})
							.catch(() => {
									const result = handleConsentResult();
									resolve(result);
								}
							)
					}
				});
			} else {
				fetchGlobalVendorList().then((vendorList) => {
					const timeout = setTimeout(() => {
						resolve({ display: false });
					}, getConsentDataTimeout);

					readConsentCookie().then((cookie) => {
						if (cookie) {
							try {
								const tcStringDecoded = decodeConsentData(cookie);
								finish(timeout, vendorList, tcStringDecoded);
							} catch (e) {
								finish(timeout, vendorList);
							}
						} else {
							finish(timeout, vendorList);
						}
					});
				}).catch(() => {
					const result = handleConsentResult();
					resolve(result);
				});
			}
		}
	});
};

const displayUI = (tcfApi, result) => {
	if (!tcfApi) {
		return;
	}

	const { shouldDisplayFooter } = config;
	let { display, command } = result;

	const tcfApiCall = (command) => {
		tcfApi(command, 2, () => log.debug(`${command} command was called`));
	};

	if (display) {
		tcfApiCall(command);
	} else if (command === 'showFooter') {
		if (shouldDisplayFooter) {
			shouldDisplayFooter((result) => {
				if (result) {
					tcfApiCall(command);
				}
			});
		}
	}
};

function readExternalConsentData(config) {
	console.log('READ');
	return new Promise((resolve, reject) => {
		try {
			config.getConsentData((err, data) => {
				if (err) {
					reject(err);
				} else {
					try {
						resolve(data.consent && data.consent || undefined);
					} catch (err) {
						reject(err);
					}
				}
			});
		} catch (err) {
			reject(err);
		}
	});
}

function start() {
	applyDecodeFix();

	// Preserve any config options already set
	const tcfConfig = window[TCF_CONFIG] || {};

	const configUpdates = {
		globalConsentLocation: 'https://rasp.mgr.consensu.org/portal.html',
		...tcfConfig
	};

	config.update(configUpdates);
	Promise.all([
		shouldDisplay(),
		// z vendorlisty odczytać tłumaczenie (jakieś dane)
		config.getConsentData ? readExternalConsentData(config) : readConsentCookie(),

	]).then(([displayOptions, consentString]) => {
		initializeStore(consentString, displayOptions.display, displayOptions.translation).then(() => {
			displayUI(window.__tcfapi, displayOptions);
		}).catch(err => {
			log.error('Failed to initialize CMP store', err);
		});
	}).catch(err => {
		log.error('Failed to load CMP', err);
	});
}

start();
