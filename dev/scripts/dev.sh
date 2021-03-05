# Pre-download the images that we'll be using
docker-compose pull

# Start a local instance of dynamodb
ts-node $(dirname "$0")/../setupLocalDB.ts

sam-proxy start $npm_package_name \
	--port ${PORT:-3000} \
	--docker-network local-ddb \
	--parameters "DynamoHost=http://dynamodb:8000,AppEnv=$APP_ENV_DEV,VoiceItAPIKey=$VOICEIT_API_KEY,VoiceItAPIToken=$VOICEIT_API_TOKEN,TwilioAccountSid=$TWILIO_ACCOUNT_SID,TwilioAuthToken=$TWILIO_AUTH_TOKEN,JWTKey=$JWT_KEY,APIHost=$API_HOST"
