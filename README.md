# Account Management PoC using Voice Biometrics

## Part of the Biometrics In Low-Tech Environments project

![CI](https://github.com/gsmainclusivetechlab/bilt-voice/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/gsmainclusivetechlab/bilt-voice/branch/feature/gh-actions/graph/badge.svg?token=CKB8C9RSXR)](https://codecov.io/gh/gsmainclusivetechlab/bilt-voice)

## Setup Guide

### Development Dependencies

Before proceeding, please ensure the following are installed on your development
machine:

-   Node
-   Git
-   [Yarn Classic](https://classic.yarnpkg.com/en/docs/install#debian-stable)
    (optional, recommended)
-   [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
-   Docker
-   Docker Compose
-   AWS SAM

### Project Setup

1. Checkout the project code locally
2. Run `yarn` to install project dependencies
3. Check the [`.env`](./.example.env) file to update any values specific to your
   environment (e.g. `AWS_PROFILE`)

## Development

### Testing

-   Run `yarn test` to run unit tests
-   Run `yarn test --watch` to run unit tests and automatically re-run tests on
    code changes
-   Add `--coverage` to the command to also calculate test coverage for your
    code
-   Add `--updateSnapshot` to automatically update any changed snapshots (but
    ensure to check the changes are correct before committing the code!)

### Running Locally

-   Run `yarn dev` to watch for file changes and start a fast local server
-   Run `yarn dev:clean` to remove any conflicting containers from a previous
    session

    If necessary, run aws config to insert your information.

## Deployment

1. Run `yarn build` to build the latest code
2. Run `yarn deploy` to create/update the cloudformation stack

### Cleanup

1. Run `yarn deploy:clean` to remove the whole AWS stack

## Twilio Setup

1. Buy a virtual phone number on Twilio If you are in the trial account and if
   it is necessary, release your current trial number:
   https://www.twilio.com/console/phone-numbers/incoming Then, buy a local
   number using the same link.
2. Obtain webhook URL
    - If local development, start the server then use ngrok to make it globally
      accessible (npx ngrok http 3000)
    - If deployed version, copy the API server url from the CloudFormation
      Output
3. Change the "A Call Comes In" webhook URL on the Twilio dashboard for your
   Webhook URL
4. Select HTTP GET method
5. Dial the virtual number and test your application

## Troubleshooting

#### `Error: EACCES: permission denied, open '{...}/dist/handlers/{someFunction}/index.js`

This error sometimes occurs when running `yarn dev`. The command does two
things: creates some docker containers to run our functions, and starts webpack
in watch mode to compile our code. Ideally, webpack compiles the code first to
create the correct directory structure. Sometimes though, the docker containers
are created first, and they implicitly create a volume (owned by `root`) where
our code should go. To resolve this, you can `chown -R` the `dist` directory to
give webpack permission to write there again.

#### The security token included in the request is invalid.

This is an error normally caused when a function can't find the DynamoDB table.
Generally this is caused when the `TABLE_NAME` variable is incorrectly set -
check [`dev/envVars.json`](./dev/envVars.json) to ensure your function is
receiving it correctly.

#### Missing credentials in config, if using AWS_CONFIG_FILE, set AWS_SDK_LOAD_CONFIG=1

The AWS SDK is unable to authenticate you. This is normally caused by a similar
error as above (`TABLE_NAME` incorrectly set). Add `AWS_ACCESS_KEY_ID` and
`AWS_SECRET_ACCESS_KEY` and `AWS_REGION` to `dev/envVars.json` for your
function.

#### `Lambda responded with undefined status code` or `index.get is undefined or not exported`

This is normally a sign that the lambda function has not been built correctly.
Try running `yarn build` before `yarn dev` again. This will often be related to
the `Error: EACCES: permission denied` error above.
