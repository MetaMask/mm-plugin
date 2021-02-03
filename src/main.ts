#!/usr/bin/env node
// eslint-disable-next-line node/shebang
import { cli } from './cli';
import { applyConfig } from './utils';
import commands from './cmds';

main();

// application
async function main(): Promise<void> {
  await applyConfig();
  cli(process.argv, commands);
}
