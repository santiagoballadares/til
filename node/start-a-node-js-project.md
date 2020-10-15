# Start a Node.js project

#### Customise `npm init`

```bash
$ npm config list -l | grep init

$ npm set init.author.name "Your name"
$ npm set init.author.email "your@email.com"
$ npm set init.author.url "https://your-url.com"
$ npm set init.license "MIT"
$ npm set init.version "1.0.0"

$ npm init -y
```

#### npx

```bash
$ npx license MIT
$ npx gitignore node
$ npx covgen YOUR_EMAIL_ADDRESS

$ npm init -y
```

#### init script

```bash
function node-project {
  git init
  npx license $(npm get init.license) -n "$(npm get init.author.name)"
  npx gitignore node
  npx covgen "$(npm get init.author.email)"
  npm init -y
  git add -A
  git commit -m "Initial commit"
}
```

Add it to your `~/.bash_profile`. Then, either `source ~/.bash_profile` or open a new command line window and run `node-project`.
