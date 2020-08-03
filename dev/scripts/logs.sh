sam logs \
	--stack-name $APP_NAME-${NAMESPACE:-dev} \
	-n "$@"