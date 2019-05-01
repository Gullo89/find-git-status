const fs = require("fs");
const path = require("path");
let globalConfig = require("../globalConfig");
const printReport = require("./printReport");
const {
  findAllGitRepos,
  findChangedRepos,
  findProjectsNotRepos,
  findReposWithoutRemote,
  addReposToIgnoreList
} = require("./gitStatus");

/**
 * Get all potential projects, all git repositories, repos without remote
 * and repos with changes.
 * @returns {Promise<>}
 */
const findAllProjects = () => {
  return new Promise(async (resolve, reject) => {
    let repositories = [];
    let projectButNotRepo = [];
    let outdatedRepos = [];
    let reposWithoutRemote = [];

    const { directories } = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../config.json"), "utf-8")
    );

    for (let i = 0; i < directories.length; i++) {
      const directory = directories[i];
      console.log("Searching " + directory);

      // Find all dirs where .git dir exist
      const reposInDir = await findAllGitRepos(
        directory,
        globalConfig.globOptions
      );

      // Add repos to ignore list, return the updated config
      globalConfig = await addReposToIgnoreList(reposInDir, globalConfig);

      // Find protential projects that arent git repositories
      const projectButNotRepoInDir = await findProjectsNotRepos(
        reposInDir,
        directory,
        globalConfig
      );

      // Check git status on repos
      const outdatedReposInDIr = await findChangedRepos(reposInDir);

      // Find repositores without remote
      const reposWithoutRemoteInDir = await findReposWithoutRemote(reposInDir);

      repositories = [...repositories, ...reposInDir];
      projectButNotRepo = [...projectButNotRepo, ...projectButNotRepoInDir];
      outdatedRepos = [...outdatedRepos, ...outdatedReposInDIr];
      reposWithoutRemote = [...reposWithoutRemote, ...reposWithoutRemoteInDir];
    }

    // Print report of findings
    printReport(
      repositories,
      projectButNotRepo,
      outdatedRepos,
      reposWithoutRemote
    );

    resolve();
  });
};

module.exports = findAllProjects;