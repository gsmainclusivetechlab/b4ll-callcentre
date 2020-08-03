import "./jest-env";
import { setupLocalDDB } from './setupLocalDB';

module.exports = async () => {
    await setupLocalDDB();
};
