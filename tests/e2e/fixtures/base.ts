import { test as base, expect } from '@playwright/test';
import { baseFixture } from '@civitas-cerebrum/element-interactions';
import * as path from 'path';

const repoPath = path.join(__dirname, '..', 'data', 'page-repository.json');
export const test = baseFixture(base, repoPath);
export { expect };
