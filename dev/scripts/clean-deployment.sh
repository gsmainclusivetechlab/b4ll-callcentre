aws cloudformation delete-stack --stack-name $APP_NAME-${NAMESPACE:-dev}

echo Tearing down stack...

aws cloudformation wait stack-delete-complete --stack-name $APP_NAME-${NAMESPACE:-dev} 
