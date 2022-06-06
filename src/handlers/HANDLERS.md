# Handler Guide

## Handler overview

All of our handlers represent an AWS Lambda function, which links to a URI
defined in the `template.yml` file, and tend to serve a single function relating
to of our use cases. Detailed information about AWS Lambdas can be found
[here](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html).

## Creating a new handler

Handlers are usually formatted as follow:

```
/**
===================================================================================================================
                                                New Handler

 * GET  =
 * POST =

===================================================================================================================
*/
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const { language } = request;

        const response = new twiml.VoiceResponse();
        response.say(
            getVoiceParams(language),
            __('example-string', language)
        );
        return response;
    },
    { /* flags go here */ }
);
```

To create a new handler, you must first create a new `index.ts` file in the
relevant directory, or a new one should be created. Once the file
`<folder>/<index>` has been created, you can start working on the handler.

Before you can test and use the handler you must first define it and assign it a
URI. This can be done in the `template.yml` file. More details can be found
[here](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-formats.html)

```
ExampleHandlerName:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.get
      CodeUri: ./dist/handlers/example
      Role: !GetAtt LambdaRole.Arn
      Events:
        HTTP:
          Type: Api
          Properties:
            Path: /{lang}/example
            Method: GET
            RestApiId:
              Ref: ApiGatewayApi
```

## Useful Functions

### Initiating a response

```
import { twiml } from 'twilio';

const response = new twiml.VoiceResponse(); // for a voice response
const response = new twiml.MessagingResponse(); // for a sms response
```

### Say / Message

```
response.say(getVoiceParams(language), __('example-string', language));
```

Note: `'example-string'` is pulled from the relevant language's string file e.g
`en-GB.json`

### Redirect

```
response.redirect({ method: 'GET' }, '/example');
```
