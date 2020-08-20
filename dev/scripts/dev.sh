# Pre-download the images that we'll be using
docker-compose pull

# Start a local instance of dynamodb
ts-node $(dirname "$0")/../setupLocalDB.ts

sam-proxy start $npm_package_name \
	--port ${PORT:-3000} \
	--docker-network local-ddb \
	--parameters "DynamoHost=http://dynamodb:8000,VoiceItAPIKey=$VOICEIT_API_KEY,VoiceItAPIToken=$VOICEIT_API_TOKEN"
