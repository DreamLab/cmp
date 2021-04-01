import config from './config';

export function findLocale() {
	const locale = config.forceLocale ||
		(navigator && (
			navigator.language ||
			navigator.browserLanguage ||
			navigator.userLanguage ||
			(navigator.languages && navigator.languages[0]) ||
			'en-us'
		));
	return locale.toLowerCase();
}
