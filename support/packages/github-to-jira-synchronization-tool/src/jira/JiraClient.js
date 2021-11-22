/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Jira = require('jira-client');

const {PASSWORD, PROJECT, USERNAME} = require('./constants');
const {getGithubMarking} = require('./github-jira-mapping/github-jira-mapping');

class JiraClient {
	constructor() {
		this.client = new Jira({
			apiVersion: '2',
			host: 'issues.liferay.com',
			password: PASSWORD,
			protocol: 'https',
			strictSSL: true,
			username: USERNAME,
		});
	}

	async searchIssueWithGithubIssueId({fields = [], githubIssueId}) {
		const query = `project=${PROJECT} AND description ~ "${getGithubMarking(
			githubIssueId
		)}"`;

		const response = await this.client.searchJira(query, {
			fields,
		});

		const {issues} = response;

		return issues[0];
	}

	async searchCommentWithGithubCommentId({githubCommentId, githubIssueId}) {
		const issue = await this.searchIssueWithGithubIssueId({githubIssueId});

		if (!issue) {
			return null;
		}

		const commentsResponse = await this.client.getComments(issue.key);

		const {comments = []} = commentsResponse;

		return {
			comment: comments.find((comment) =>
				comment.body.includes(getGithubMarking(githubCommentId))
			),
			issueId: issue.key,
		};
	}

	createIssue({assignee, description, milestone, title, type = 'Task'}) {
		const fields = {
			customfield_12821: milestone,
			description,
			issuetype: {
				name: type,
			},
			project: {
				key: PROJECT,
			},
			summary: title,
		};

		if (assignee) {
			fields.assignee = {
				name: assignee,
			};
		}

		return this.client.addNewIssue({
			fields,
		});
	}

	getIssue({fields, issueId}) {
		return this.client.getIssue(issueId, fields);
	}

	updateIssueEpic({epic, issueId}) {
		return this.client.updateIssue(issueId, {
			fields: {
				customfield_12821: epic,
			},
		});
	}

	transitionIssue({issueId, transition}) {
		this.client.transitionIssue(issueId, transition);
	}

	updateIssue({assignee, description, issueId, milestone, title, type}) {
		const fields = {};

		if (assignee) {
			fields.assignee = {
				name: assignee,
			};
		}

		if (description) {
			fields.description = description;
		}

		if (milestone) {
			fields.customfield_12821 = milestone;
		}

		if (title) {
			fields.summary = title;
		}

		if (type) {
			fields.issuetype = {
				name: type,
			};
		}

		return this.client.updateIssue(issueId, {
			fields,
		});
	}

	createComment({comment, issueId}) {
		return this.client.addComment(issueId, comment);
	}

	updateComment({comment, commentId, issueId}) {
		return this.client.updateComment(issueId, commentId, comment);
	}

	deleteComment({commentId, issueId}) {
		return this.client.deleteComment(issueId, commentId);
	}
}

module.exports = JiraClient;
