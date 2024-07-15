import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchData } from '@libs/services/fetch.service';

@Injectable()
export class GithubService {
  private readonly githubToken: string;
  private readonly owner: string;
  private readonly collaborator: string;
  private readonly repo: string;

  constructor(private configService: ConfigService) {
    this.githubToken = this.configService.get<string>('TOKEN');
    this.owner = this.configService.get<string>('OWNER');
    this.collaborator = this.configService.get<string>('COLLABORATOR');
    this.repo = this.configService.get<string>('REPO');
  }

  private getHeaders(token?: string) {
    return {
      Authorization: `token ${this.githubToken || token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async createPullRequest(head: string, base: string, title: string, body: string): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`;
    console.log('PR URL: ', url);

    const data = {
      title,
      head,
      base,
      body,
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(), data);
      console.log('Pull request created successfully:', response.data.html_url);
      return response;
    } catch (error) {
      console.error(
        'Error creating pull request:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async commentOnPullRequest(
    pullRequestNumber: number,
    comment: string,
    username: string,
    token: string,
  ): Promise<void> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/issues/${pullRequestNumber}/comments`;

    const data = {
      body: comment,
      user: username,
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(token), data);
      console.log('Comment added successfully:', response.data);
    } catch (error) {
      console.error('Error adding comment:', error.response ? error.response.data : error.message);
    }
  }

  async requestChangesOnPullRequest(
    pullRequestNumber: number,
    comment: string,
    username: string,
    token: string,
  ): Promise<void> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${pullRequestNumber}/reviews`;

    const data = {
      body: comment,
      event: 'REQUEST_CHANGES',
      user: username,
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(token), data);

      console.log('Requested changes successfully:', response.data);
    } catch (error) {
      console.error(
        'Error requesting changes:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async approvePullRequest(pullRequestNumber: number): Promise<void> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${pullRequestNumber}/reviews`;
    const data = {
      event: 'APPROVE',
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(), data);
      console.log('Pull request approved successfully:', response.data);
    } catch (error) {
      console.error(
        'Error approving pull request:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async closePullRequest(pullRequestNumber: number): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${pullRequestNumber}`;

    const data = {
      state: 'closed',
    };

    try {
      const response = await fetchData(url, 'PATCH', this.getHeaders(), data);
      console.log('Pull request closed successfully:', response);
      return response;
    } catch (error) {
      console.error(
        'Error closing pull request:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async reOpenPullRequest(pullRequestNumber: number): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${pullRequestNumber}`;
    const data = {
      state: 'open',
    };

    try {
      const response = await fetchData(url, 'PATCH', this.getHeaders(), data);
      return response;
    } catch (error) {
      throw new Error(
        'Error reopening pull request: ' + (error.response ? error.response.data : error.message),
      );
    }
  }

  async getPullRequests(owner: string, repo: string) {
    try {
      const response = await fetchData(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        'GET',
        this.getHeaders(),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error getting pull requests:',
        error.response ? error.response.data : error.message,
      );
    }
  }
}
