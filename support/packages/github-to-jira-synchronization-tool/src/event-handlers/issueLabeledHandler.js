/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../JiraClient');
const {getLabelMapping} = require('../config/config');

const issueMilestonedHandler = {
	canHandleEvent(name, payload) {
		return (
			name === 'issues' &&
			(payload.action === 'labeled' || payload.action === 'unlabeled')
		);
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await jiraClient.searchIssueWithGithubIssueId({
			githubIssueId: issue.html_url,
		});

		const [firstLabel = {}] = issue.labels;

		const type = getLabelMapping(firstLabel.name);

		return jiraClient.updateIssue({issueId: jiraIssue.key, type});
	},
};

module.exports = issueMilestonedHandler;
