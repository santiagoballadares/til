# Manipulate git repositories with Node.js
Wanted to get a repository commit history with Node.js. So, after a quick search I found [NodeGit](https://www.nodegit.org/) which implements native bindings to the libgit2 project.
#### Imports
```javascript
const NodeGit = require('nodegit');
const Promise = require('promise');
```
#### Clone
```javascript
const clone = async () => {
  let repo;
  try {
    repo = await NodeGit.Clone(repoUrl, localPath, options);
    console.log(`Cloned to ${repo.workdir()}`);
  } catch (error) {
    // Already cloned
  }
  return repo;
};
```
#### Open
```javascript
const open = async () => {
  let repo;
  try {
    repo = await NodeGit.Repository.open(localPath);
    console.log(`Opened ${repo.path()}`);
  } catch (error) {
    console.log(`Error opening ${repo.workdir()}: ${error}`);
  }
  return repo;
};
```
#### Get commit history
```javascript
const getCommitHistory = async (repo) => {
  const currentBranch = await repo.getCurrentBranch();
  if (currentBranch) {
    console.log(`On ${currentBranch.shorthand()} (${currentBranch.target()})`);
    const currentBranchCommit = await repo.getBranchCommit(currentBranch.shorthand());
    const history = currentBranchCommit.history();
    const promise = new Promise((resolve, reject) => {
      history.on('end', resolve);
      history.on('error', reject);
    });
    history.start();
    return promise;
  }
};
```
