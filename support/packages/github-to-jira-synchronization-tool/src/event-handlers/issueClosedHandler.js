/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../JiraClient');
const {JIRA_STATUS, JIRA_TRANSITIONS} = require('../config/jiraTransitions');

const issueClosedHandler = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'closed';
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await jiraClient.searchIssueWithGithubIssueId({
			fields: ['status'],
			githubIssueId: issue.html_url,
		});

		const jiraStatusNames = jiraIssue.fields.status.name;

		if (jiraStatusNames !== JIRA_STATUS.closed) {
			return await jiraClient.transitionIssue({
				issueId: jiraIssue.key,
				transition: JIRA_TRANSITIONS.close,
			});
		}
	},
};

module.exports = issueClosedHandler;
