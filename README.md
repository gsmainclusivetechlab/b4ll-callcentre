# Account Management PoC using Voice Biometrics 
## Part of the Biometrics In Low-Tech Environments project)

## Setup Guide

### Development Dependencies

Before proceeding, please ensure the following are installed on your development
machine:

-   Node
-   Git
-   Yarn (optional, recommended)
-   AWS CLI
-   Docker
-   Docker Compose
-   AWS SAM

### Project Setup

1. Checkout the project code locally
2. Run `yarn` to install project dependencies
3. Check the [`.env`](./.env.example) file to update any values specific to your
   environment (e.g. `AWS_PROFILE`)

## Development

### Testing

-   Run `yarn test` to run unit tests
-   Run `yarn test --watch` to run unit tests and automatically re-run tests on
    code changes

### Running Locally

-   Run `yarn dev` to watch for file changes and start a fast local server
-   Run `yarn dev:clean` to remove any conflicting containers from a previous
    session

## Deployment

1. Run `yarn build` to build the latest code
2. Run `yarn deploy` to create/update the cloudformation stack

### Cleanup

1. Run `yarn deploy:clean` to remove the whole AWS stack

## Twilio Setup

1. Buy a virtual phone number on Twilio
2. Obtain webhook URL
    - If local development, start the server then use ngrok to make it globally
      accessible
    - If deployed version, copy the API server url from the CloudFormation
      Output
3. Change the "A Call Comes In" webhook URL on the Twilio dashboard
4. Dial the virtual number and test your application
