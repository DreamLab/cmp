import Promise from 'promise-polyfill';
import config from './config';
import log from './log';
import { fetch } from './helpers';

/**
 * Fetch the global vendor list if the location is configured
 */
function fetchGlobalVendorList() {
	const { globalVendorListLocation, getVendorList } = config;
	if (getVendorList) {
		return new Promise((resolve, reject) => {
			try {
				getVendorList((err, data) => {
					if (err) {
						reject(err);
					} else {
						try {
							resolve(data);
						} catch (error) {
							reject(error);
						}
					}
				});
			} catch (err) {
				reject(err);
			}
		}).catch(err => {
			log.error(`Failed to load global vendor list from configuration`, err);
		});
	}
	return (globalVendorListLocation ?
		fetch(globalVendorListLocation) :
		Promise.reject('Missing globalVendorListLocation'))
		.then(res => res.json())
		.catch(err => {
			log.error(`Failed to load global vendor list from ${globalVendorListLocation}`, err);
		});
}

export {
	fetchGlobalVendorList,
};
