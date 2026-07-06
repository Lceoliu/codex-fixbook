// GITHUB_REPOSITORY is set automatically in GitHub Actions ("owner/repo").
// Override with REPO_SLUG for local builds that need correct links.
const repoSlug = process.env.REPO_SLUG ?? process.env.GITHUB_REPOSITORY ?? "Lceoliu/codex-fixbook";

export const repoUrl = `https://github.com/${repoSlug}`;
export const submitFixUrl = `${repoUrl}/issues/new?template=fix-submission.yml`;

