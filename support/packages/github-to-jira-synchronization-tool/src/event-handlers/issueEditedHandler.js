/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../JiraClient');
const {
	addGithubIssueToBody,
} = require('../github-jira-mapping/github-jira-mapping');

const issueEditedHandler = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'edited';
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await jiraClient.searchIssueWithGithubIssueId({
			githubIssueId: issue.html_url,
		});

		const options = {
			description: addGithubIssueToBody(issue.html_url, issue.body),
			title: issue.title,
		};

		return jiraClient.updateIssue({issueId: jiraIssue.key, ...options});
	},
};

module.exports = issueEditedHandler;
