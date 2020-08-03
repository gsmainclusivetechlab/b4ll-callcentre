import { readFileSync } from 'fs';
import { yamlParse } from 'yaml-cfn';
import * as t from 'io-ts';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

function substituteVars(s: string) {
    return s.replace(/\$\{([^}]+)\}/g, (orig, v) => {
        switch (v) {
            case 'Namespace':
                return process.env.STAGE || 'jest';
        }
        return orig;
    });
}

const Subbable = new t.Type<string, string, unknown>(
    'string',
    (input: unknown): input is string =>
        typeof input === 'string' ||
        (typeof input === 'object' && input !== null && 'Fn::Sub' in input),
    (input, context) => {
        if (typeof input === 'string') return t.success(input);
        if (typeof input === 'object' && input !== null && 'Fn::Sub' in input) {
            const i = input as { 'Fn::Sub': unknown };
            if (typeof i['Fn::Sub'] === 'string')
                return t.success(substituteVars(i['Fn::Sub']));
        }
        return t.failure(input, context);
    },
    t.identity
);

const ServerlessFunction = t.type({
    Type: t.literal('AWS::Serverless::Function'),
    Properties: t.type({
        Runtime: t.union([t.undefined, t.string]),
        Handler: t.string,
        CodeUri: t.string,
    }),
});
export type ServerlessFunctionTemplate = t.TypeOf<typeof ServerlessFunction>;

const DynamoDBTable = t.type({
    Type: t.literal('AWS::DynamoDB::Table'),
    Properties: t.type({
        TableName: Subbable,
        AttributeDefinitions: t.array(
            t.type({
                AttributeName: t.string,
                AttributeType: t.keyof({ S: null, N: null }),
            })
        ),
        KeySchema: t.array(
            t.type({
                AttributeName: t.string,
                KeyType: t.keyof({ HASH: null, RANGE: null }),
            })
        ),
        ProvisionedThroughput: t.type({
            ReadCapacityUnits: t.number,
            WriteCapacityUnits: t.number,
        }),
    }),
});
export type DynamoDBTableTemplate = t.TypeOf<typeof DynamoDBTable>;

const CloudFormationSchema = t.intersection([
    // optional properties
    t.partial({
        Globals: t.partial({
            Function: t.partial({
                Runtime: t.string,
            }),
        }),
    }),
    t.type({
        Resources: t.record(
            t.string,
            t.union([
                ServerlessFunction,
                DynamoDBTable,
                t.type({
                    Type: t.string,
                }),
            ])
        ),
    }),
]);
export type CloudFormationTemplate = t.TypeOf<typeof CloudFormationSchema>;

export function getTemplate(templatePath: string): CloudFormationTemplate {
    const parseResult = pipe(
        either.tryCatch(
            () => yamlParse(readFileSync(templatePath).toString()),
            // ignore validation errors for now (TODO: nicer errors)
            (e) => {
                console.error(e);
                return []
            }
        ),
        either.chain(CloudFormationSchema.decode)
    );

    if (either.isLeft(parseResult)) {
        console.log(parseResult.left)
        throw new Error('Unable to parse yaml');
    }
    return parseResult.right;
}
