// Start the backend API and the frontend web server with one command:
//     node app.js
//
// This file only starts processes; it does not alter database data.
const { spawn } = require('child_process');
const path = require('path');

const services = [
    { name: 'Backend', file: 'app.js', directory: 'backend', url: 'http://localhost:5000' },
    { name: 'Frontend', file: 'server.js', directory: 'frontend', url: 'http://localhost:3000' }
];
let stopping = false;

console.log('====================================================');
console.log('  Starting Vehicle Rental Management System');
for (const service of services) console.log(`  ${service.name}: ${service.url}`);
console.log('  Press Ctrl+C to stop both servers.');
console.log('====================================================');

const children = services.map((service) => {
    const child = spawn(process.execPath, [service.file], {
        cwd: path.join(__dirname, service.directory),
        stdio: 'inherit',
        windowsHide: true
    });

    child.on('error', (error) => {
        console.error(`${service.name} could not start: ${error.message}`);
    });

    child.on('exit', (code, signal) => {
        if (!stopping) {
            if (signal === 'SIGINT' || signal === 'SIGTERM') {
                stopAll();
                return;
            }
            console.error(`${service.name} stopped unexpectedly (${signal || `exit code ${code}`}).`);
            stopAll(code || 1);
        }
    });

    return child;
});

function stopAll(exitCode = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children) {
        if (!child.killed) child.kill();
    }
    process.exit(exitCode);
}

process.on('SIGINT', () => stopAll());
process.on('SIGTERM', () => stopAll());
