/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../JiraClient');
const {
	addGithubIssueToBody,
} = require('../github-jira-mapping/github-jira-mapping');

const issueCommentCreatedHandler = {
	canHandleEvent(name, payload) {
		return name === 'issue_comment' && payload.action === 'created';
	},

	async handleEvent({comment, issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await jiraClient.searchIssueWithGithubIssueId({
			githubIssueId: issue.html_url,
		});

		return await jiraClient.createComment({
			comment: addGithubIssueToBody(comment.html_url, comment.body),
			issueId: jiraIssue.key,
		});
	},
};

module.exports = issueCommentCreatedHandler;
