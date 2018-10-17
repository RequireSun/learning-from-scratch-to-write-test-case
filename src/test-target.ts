'use strict';

export function someProcessAsyncFake (willError: boolean, callback: (err?: Error, data?: any) => any): void {
    setTimeout(() => {
        if (willError) {
            callback(new Error('process error!'));
        } else {
            callback(undefined, {
                msg: 'ok',
            });
        }
    }, 200);
}

export async function twoProcessAsyncFake(callbacks: ((...args: any[]) => any)[]): Promise<any> {
    return await Promise.all(callbacks.map(callback => new Promise(res => {
        setTimeout(() => {
            callback();
            res();
        }, Math.round(Math.random() * 1000));
    })));
}

export function random (max: number): number {
    return Math.floor(Math.random() * max);
}

export function getANumber (input: number): number {
    return input * random(input);
}
