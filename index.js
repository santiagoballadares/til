const NodeGit = require('nodegit');
const Path = require('path');
const Promise = require('promise');
const Glob = require('glob-promise');
const fs = require('fs').promises;

const COUNTER_START_TAG = '<!-- counter start -->';
const COUNTER_END_TAG = '<!-- counter end -->';
const ENTRIES_START_TAG = '<!-- entries start -->';
const ENTRIES_END_TAG = '<!-- entries end -->';

const REPO_DIR = 'tmp';

const repoUrl = 'https://github.com/santiagoballadares/til';
const localPath = `./${REPO_DIR}`;
const options = {};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; ++index) {
    await callback(array[index], index, array);
  }
}

const cloneOrOpen = async () => {
  try {
    return await NodeGit.Clone(repoUrl, localPath, options);
  } catch (error) {
    return await NodeGit.Repository.open(localPath);
  }
};

const getCommitHistory = async (repo) => {
  const currentBranch = await repo.getCurrentBranch();

  if (currentBranch) {
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

const getChangedFiles = async (commit) => {
  const arrayDiff = await commit.getDiff();
  const files = [];

  await asyncForEach(arrayDiff, async (diff) => {
    const patches = await diff.patches();

    await asyncForEach(patches, async (patch) => {
      files.push(patch.newFile().path());
    });
  });

  return files;
};

const getFilesCommitTimes = async () => {
  const repo = await cloneOrOpen();
  const commitTimes = {};

  if (repo) {
    const commits = await getCommitHistory(repo) || [];

    for (const commit of commits) {
      const date = commit.date();
      const changedFiles = await getChangedFiles(commit);

      for (const filepath of changedFiles) {
        if (!commitTimes[filepath]) {
          commitTimes[filepath] = { created: date.toISOString() };
        } else {
          commitTimes[filepath] = { updated: date.toISOString() };
        }
      }
    }
  }

  return commitTimes;
};

const getMDFiles = async () => {
  const options = { cwd: `${Path.dirname(require.main.filename)}/${REPO_DIR}` };
  const mdFiles = await Glob('**/*.md', options) || [];

  return mdFiles.filter(filepath => filepath.includes('/'));
};

const getAllEntries = async () => {
  const filesCommitTimes = await getFilesCommitTimes();
  const mdFiles = await getMDFiles();

  return Promise.all(mdFiles.map(async (filepath) => {
    const subject = filepath.split('/')[0];
    const fileData = await fs.readFile(`${REPO_DIR}/${filepath}`, 'utf8');
    const title = fileData.substring(fileData.indexOf('# ') + 2, fileData.indexOf('\n'));
    const url = `https://github.com/santiagoballadares/til/blob/master/${filepath}`

    return {
      subject,
      title,
      url,
      ...filesCommitTimes[filepath],
    };
  }));
};

const getCounterContent = (allEntries = []) => {
  return `${COUNTER_START_TAG}${allEntries.length}${COUNTER_END_TAG}`;
};

const getGroupedEntriesbySubject = async (allEntries = []) => {
  const groupedEntries = {};

  for (const entry of allEntries) {
    const { subject, ...restOfEntry } = entry;

    if (!groupedEntries[subject]) {
      groupedEntries[subject] = [];
    }

    groupedEntries[subject].push({ ...restOfEntry });
  }

  return groupedEntries;
};

const getEntriesContent = async (allEntries = []) => {
  const groupedEntries = await getGroupedEntriesbySubject(allEntries);

  const lines = [ENTRIES_START_TAG];

  for (const [subject, entries] of Object.entries(groupedEntries)) {
    lines.push(`## ${subject}\n`);

    for (const entry of entries) {
      const { title, url, created } = entry;
      lines.push(`* [${title}](${url}) - ${created.split('T')[0]}`);
    }
  }

  lines.push(ENTRIES_END_TAG);

  return lines.join('\n');
};

const run = async () => {
  const allEntries = await getAllEntries();
  allEntries.sort((a, b) => new Date(a.created) - new Date(b.created));

  const counterContent = getCounterContent(allEntries);
  const entriesContent = await getEntriesContent(allEntries);

  const readmeFilepath = `${Path.dirname(require.main.filename)}/README.md`;
  const readmeContent = await fs.readFile(readmeFilepath, 'utf8');

  const counterStart = readmeContent.indexOf(COUNTER_START_TAG);
  const counterEnd = readmeContent.indexOf(COUNTER_END_TAG);
  let readmeRewritten = `${readmeContent.slice(0, counterStart)}${counterContent}${readmeContent.slice(counterEnd + COUNTER_END_TAG.length + 1)}`;

  const entriesStart = readmeRewritten.indexOf(ENTRIES_START_TAG);
  const entriesEnd = readmeRewritten.indexOf(ENTRIES_END_TAG);
  readmeRewritten = `${readmeRewritten.slice(0, entriesStart)}${entriesContent}${readmeRewritten.slice(entriesEnd + ENTRIES_END_TAG.length + 1)}`;

  fs.writeFile(readmeFilepath, readmeRewritten);
};

run();
