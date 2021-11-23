/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../JiraClient');
const getJiraMilestoneId = require('../utils/getJiraMilestoneId');
const isValidMilestone = require('../utils/isValidMilestone');

const issueMilestonedHandler = {
	canHandleEvent(name, payload) {
		return (
			name === 'issues' &&
			(payload.action === 'milestoned' ||
				payload.action === 'demilestoned')
		);
	},

	async handleEvent({action, issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await jiraClient.searchIssueWithGithubIssueId({
			githubIssueId: issue.html_url,
		});

		if (action === 'demilestoned') {
			return jiraClient.updateIssueEpic({
				epic: null,
				issueId: jiraIssue.key,
			});
		}

		const {milestone} = issue;

		const jiraMilestoneId = getJiraMilestoneId(milestone.title);

		if (isValidMilestone(jiraMilestoneId, jiraClient)) {
			return jiraClient.updateIssueEpic({
				epic: jiraMilestoneId,
				issueId: jiraIssue.key,
			});
		}
	},
};

module.exports = issueMilestonedHandler;
