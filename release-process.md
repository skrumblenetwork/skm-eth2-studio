# Release process
This document details steps for publishing packages and tag the code base accordingly:


1) publish  all the modules that depends on one of the newly published module:

- checkout a new branch from master
- npm run publish
- commit

2) increment the root (repository scoped) package.json

- increment root package.json version
- commit
- merge the branch

3) create a tag (using the package.json version)

- checkout latest origin/master
- npm run tag
- github-changes -o skrumble -r remix -a --only-pulls --use-commit-body --only-merges --between-tags previous_version...next_version 
- create a new release out of the changelog.md
- in changelog put list of published packages with version


