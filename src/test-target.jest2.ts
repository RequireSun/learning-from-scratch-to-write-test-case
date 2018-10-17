'use strict';

import { random, } from './test-target.jest';

export function useRandom (input: number): number {
    return random(input + 7);
}