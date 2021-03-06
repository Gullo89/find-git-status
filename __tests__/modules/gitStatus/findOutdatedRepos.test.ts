import { findChangedRepos } from "../../../src/modules/gitStatus";
import * as promisifyChildProcess from "promisify-child-process";
import { mocked } from "ts-jest/utils";

jest.mock("promisify-child-process");
const { exec } = mocked(promisifyChildProcess);

beforeEach(() => {
  // Reset mock so that mockResolvedValueOnce works correctly
  exec.mockReset();
});

describe("findChangedRepos", () => {
  test("should return empty array if no repositories is given", () => {
    const repositories = [];

    exec.mockResolvedValue({ stdout: "" });

    return findChangedRepos(repositories).then(result => {
      expect(result).toEqual([]);
      expect(exec.mock.calls.length).toBe(0);
    });
  });

  test("should return empty array if none of the repositories is outdated", () => {
    const repositories = [
      { name: "proj", path: "testDir/proj" },
      { name: "proj2", path: "testDir/dir2/proj2" }
    ];

    exec.mockResolvedValue({ stdout: "" });

    return findChangedRepos(repositories).then(result => {
      expect(result).toEqual([]);
      expect(exec.mock.calls.length).toBe(2);
    });
  });

  test("should return array with one element if one of the repositories is outdated", () => {
    const repositories = [
      { name: "proj", path: "testDir/proj" },
      { name: "proj2", path: "testDir/dir2/proj2" }
    ];

    const expectedResult = [
      { name: "proj2", path: "testDir/dir2/proj2", changes: ["?? README.md"] }
    ];

    exec
      .mockResolvedValueOnce({ stdout: "" })
      .mockResolvedValueOnce({ stdout: "?? README.md" });

    return findChangedRepos(repositories).then(result => {
      expect(result).toEqual(expectedResult);
      expect(exec.mock.calls.length).toBe(2);
    });
  });
});
