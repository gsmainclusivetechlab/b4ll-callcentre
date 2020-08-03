import './jest-env';
import { down } from 'docker-compose';

module.exports = async () => {
    process.stdout.write('Stopping DynamoDB... ');
    await down({ cwd: __dirname });
    console.log('[Done]');
};
