const { shellExec } = require('./shell');

const dockerInspect = () => {
    return shellExec(`docker container inspect -f '{{.State.Status}}' ${process.env.CONTAINER_NAME}`);
};

const dockerStart = () => {
    return shellExec(`docker start ${process.env.CONTAINER_NAME}`);
};

const dockerUnpause = () => {
    return shellExec(`docker unpause ${process.env.CONTAINER_NAME}`);
};

const dockerStop = () => {
    return shellExec(`docker stop ${process.env.CONTAINER_NAME}`);
};

const dockerHealthy = async () => {
    const status = await shellExec(`docker container inspect -f '{{.State.Health.Status}}' ${process.env.CONTAINER_NAME}`);
    return status === 'healthy';
};

module.exports = {
    dockerInspect,
    dockerStart,
    dockerUnpause,
    dockerStop,
    dockerHealthy
};