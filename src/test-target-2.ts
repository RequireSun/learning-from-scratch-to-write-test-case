'use strict';

import { random, } from './test-target';

export function useRandom (input: number): number {
    return random(input + 7);
}