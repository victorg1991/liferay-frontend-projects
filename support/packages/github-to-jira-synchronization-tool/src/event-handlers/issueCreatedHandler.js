/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../JiraClient');
const {
	addGithubIssueToBody,
} = require('../github-jira-mapping/github-jira-mapping');

const issueCreatedHandler = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'opened';
	},

	handleEvent({issue}) {
		const jiraClient = new JiraClient();

		return jiraClient.createIssue({
			description: addGithubIssueToBody(issue.html_url, issue.body),
			title: issue.title,
		});
	},
};

module.exports = issueCreatedHandler;
