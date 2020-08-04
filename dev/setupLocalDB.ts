import { upOne } from 'docker-compose';
import AWS from 'aws-sdk';
import { getTemplate, DynamoDBTableTemplate } from './parseTemplate';

export async function setupLocalDDB(): Promise<void> {
    const ddbPromise = upOne('dynamodb', { cwd: __dirname });
    const cfn = getTemplate(__dirname + '/../template.yaml');
    const tables = Object.values(cfn.Resources).filter(
        (r): r is DynamoDBTableTemplate => r.Type === 'AWS::DynamoDB::Table'
    );
    await ddbPromise.then(async () => {
        process.stdout.write('\nSetting up test tables... ');
        const db = new AWS.DynamoDB({
            endpoint: `http://localhost:${process.env.DDB_PORT || 8000}`,
            sslEnabled: false,
            region: 'local-env',
        });
        const currentTables =
            (await db.listTables().promise()).TableNames || [];
        await Promise.all(
            tables.map(async (t, i) => {
                const TableName = t.Properties.TableName || `Table${i}`;
                if (currentTables.indexOf(TableName) >= 0) {
                    // table was already created - let's remove it to start afresh
                    await db
                        .deleteTable({
                            TableName,
                        })
                        .promise();
                }
                return db.createTable({ ...t.Properties, TableName }).promise();
            })
        );
        console.log('[Done]');
    });
}

if (require.main === module) {
    // if called directly from the command line, execute now
    setupLocalDDB();
}
