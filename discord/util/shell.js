const { exec } = require('node:child_process');

const shellExec = (command) => {
    return new Promise(async (resolve, reject) => {
        await exec(command, async (err, stdout) => {
            if (err) {
                reject(err);
            }

            resolve(stdout.trim());
        });
    });
};

module.exports = {
    shellExec
};
