/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

let config = null;

function loadConfig() {
	if (config) {
		return config;
	}

	try {
		const json = fs.readFileSync(
			path.resolve(__dirname, '../../mapping-config.json'),
			'utf-8'
		);

		const parsed = JSON.parse(json);

		config = parsed;

		return config;
	}
	catch (error) {
		console.error(
			'mapped-config.json cannot be read, please make sure to create it in the root of the project'
		);

		process.exit(1);
	}
}

function getUserMapping(username) {
	const mappingConfig = loadConfig();

	const userMappings = mappingConfig.userMappings;

	return userMappings[username] || userMappings.default;
}

function getLabelMapping(label) {
	const mappingConfig = loadConfig();

	const labelMappings = mappingConfig.labelMappings;

	return labelMappings[label] || labelMappings.default;
}

module.exports = {getLabelMapping, getUserMapping, loadConfig};
