sam deploy \
	--template-file template.yaml \
	--s3-bucket $DEPLOYMENT_BUCKET_NAME \
	--stack-name $APP_NAME-${NAMESPACE:-dev} \
	--capabilities CAPABILITY_IAM \
	--no-confirm-changeset \
	--no-fail-on-empty-changeset \
		--parameter-overrides \
		VoiceItAPIKey=$VOICEIT_API_KEY \
		VoiceItAPIToken=$VOICEIT_API_TOKEN \
		JWTKey=$JWT_KEY
