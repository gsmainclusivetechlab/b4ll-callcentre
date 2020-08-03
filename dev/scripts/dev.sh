# Pre-download the images that we'll be using
docker-compose pull

# Start a local instance of dynamodb
ts-node $(dirname "$0")/../setupLocalDB.ts

sam-proxy start $npm_package_name \
	--port ${PORT:-3000} \
	--env-vars $(dirname "$0")/envVars.json \
	--docker-network local-ddb
