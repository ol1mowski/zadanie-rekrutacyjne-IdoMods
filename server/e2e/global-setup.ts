import { FullConfig } from '@playwright/test';
import { spawn, ChildProcess } from 'node:child_process';

let serverProcess: ChildProcess;

async function globalSetup(config: FullConfig) {
  console.log('Uruchamianie serwera dla testów e2e...');
  serverProcess = spawn('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3000'
    },
    shell: true,
    stdio: 'inherit'
  });
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Serwer uruchomiony, rozpoczynam testy...');
}

async function globalTeardown() {
  console.log('Zamykanie serwera...');
  if (serverProcess) {
    serverProcess.kill();
  }
}

export default globalSetup;
export { globalTeardown }; 