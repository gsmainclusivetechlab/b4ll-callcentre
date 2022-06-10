# Deployment

## Configuration

Before deploying, make sure the AWS configurations are set properly in the
`.env` file.

```
AWS_ACCESS_KEY_ID={YOUR_ACCESS_KEY}
AWS_SECRET_ACCESS_KEY={YOUR_SECRET_ACCESS_KEY}
AWS_REGION={YOUR_REGION}

NAMESPACE={namespace-name}

APP_NAME={app-name}
DEPLOYMENT_BUCKET_NAME={bucket-name}
```

If using a biometrics provider & Twilio, make sure configurations are set for
those.

```
# VoiceIt
VOICEIT_API_KEY={KEY}
VOICEIT_API_TOKEN={TOKEN}

# Twilio
TWILIO_ACCOUNT_SID={ACCOUNT_SID}
TWILIO_AUTH_TOKEN={AUTH_TOKEN}
```

The `API_HOST` and `JWT_KEY` also need to be set:

```
API_HOST={LINK_FOR_CALLBACK}
JWT_KEY={shh_this_is_secret}
```

All environment variables for deployment can be found in the
`dev/scripts/deploy.sh` file.

### Commands

1. Run `yarn build` to build the latest code
2. Run `yarn deploy` to create/update the cloudformation stack

### Cleanup

1. Run `yarn deploy:clean` to remove the whole AWS stack
