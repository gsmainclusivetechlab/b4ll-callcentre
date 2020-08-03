sam deploy \
	--template-file template.yaml \
	--s3-bucket $DEPLOYMENT_BUCKET_NAME \
	--stack-name $APP_NAME-${NAMESPACE:-dev} \
	--capabilities CAPABILITY_IAM \
	--no-confirm-changeset \
	--no-fail-on-empty-changeset
