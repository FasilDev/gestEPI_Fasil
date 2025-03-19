const { execSync } = require('child_process');

const runCommand = (command) => {
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (e) {
        console.error(`Failed to execute ${command}`, e);
        return false;
    }
};

console.log('Cloning repository with name GestEPIBack');
const gitCommand = 'git clone --depth 1 https://github.com/Romeo-Giorgio/create-express-ts-mariadb-api.git GestEPIBack';
const gitCloneResult = runCommand(gitCommand);

if (!gitCloneResult) process.exit(-1);