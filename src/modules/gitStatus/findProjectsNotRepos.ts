import glob from "glob";
import { GitProject } from "../../types";

/**
 * Find all potential projects that are not git repositories.
 * @param {Array<object>} repositories The repositories previously found
 * @param {string} directory The directory to search
 * @param {object} globalConfig The globalConfig
 * @returns {Promise<object>} The projects
 */
const findProjectsNotRepos = (repositories, directory, globalConfig): Promise<GitProject[]> => {
  return new Promise((resolve, reject) => {
    // If not all arguments is given, reject
    if (
      typeof repositories === "undefined" ||
      typeof directory === "undefined" ||
      typeof globalConfig === "undefined"
    ) {
      reject("Missing arguments..");
      return;
    }

    const { isProjectCheck, globOptions } = globalConfig;
    const projectButNotRepo: GitProject[] = [];

    // The glob search pattern
    const projectCheckPattern =
      directory + "/**/*(" + isProjectCheck.join("|") + ")";

    glob(projectCheckPattern, globOptions, (err, res) => {
      if (err) {
        console.log("Error", err);
      } else {
        // Sort ascending by length of path
        res.sort((a, b) => a.length - b.length);

        res.forEach(path => {
          // Split the path into an array.
          const pathArray = path.split("/");

          // Get the name of the current directory
          const repo = pathArray.slice(-2)[0];

          // Is a section of the path already marked as a project?
          let repoExistsInProjectArr = projectButNotRepo.some(el =>
            pathArray.includes(el.name)
          );

          // Is a section of the path already marked as a git repository?
          let repoExistsInRepoArr = repositories.some(el =>
            pathArray.includes(el.name)
          );

          /**
           * If the current directory is not already marked as a
           * project or git repo, add it as a object to the project array.
           */
          if (!repoExistsInRepoArr && !repoExistsInProjectArr) {
            projectButNotRepo.push({
              name: repo,
              path: path.substring(0, path.lastIndexOf("/"))
            });
          }
        });

        resolve(projectButNotRepo);
      }
    });
  });
};

export default findProjectsNotRepos;
