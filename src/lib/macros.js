const macros = {
	// Blick translation
	'de_blick': {
		'_PUBLISHER_': 'Ringier',
		'_POLICY_URL_': 'https://www.blick.ch/services/datenschutzbestimmungen-id151553.html'
	},
	// RASCH translation
	'de_rasch': {
		'_PUBLISHER_': 'Ringier Axel Springer Schweiz',
		'_POLICY_URL_': 'https://www.cash.ch/ueberuns/rechtliche-hinweise/datenschutzbestimmungen-detail#rechte'
	}
};

const replaceMacros = (text, translationCode) => {
	const toReplace = macros[translationCode];
	if (!toReplace) {
		return text;
	}

	return Object.keys(toReplace).reduce((acc, key) => {
		return acc.replace(new RegExp(key, 'g'), toReplace[key]);
	}, text);
};

export default replaceMacros;
