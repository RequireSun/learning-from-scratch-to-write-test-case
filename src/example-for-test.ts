'use strict';

export function normalLoop (loopCount: number): number {
    var count: number = 0;

    for (let i: number = 0; i < loopCount; ++i) {
        ++count;
    }

    return count;
}

export interface ArrayDataItem {
    timestamp: number;
    date?: string;
}

export function formatDate (data: ArrayDataItem[]): ArrayDataItem[] {
    for (let i = 0, l = data.length; i < l; ++i) {
        const date: Date = new Date(data[i].timestamp);

        data[i].date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    return data;
}

export function returnSth (type: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'NaN' | 'null' | 'undefined' = 'boolean'): string | boolean | number | object | null | void {
    switch (type) {
        case 'string':
            return 'yes!';
        case 'boolean':
            return true;
        case 'number':
            return 1;
        case 'object':
            return { a: 1, b: { c: 3, }, };
        case 'array':
            return [ 1, ];
        case 'NaN':
            return NaN;
        case 'null':
            return null;
    }
}

export function someProcessSyncFake (willError: boolean): boolean {
    // some conditions
    if (willError) {
        return true;
    } else {
        return false;
    }
}

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

export async function asyncTwoCallback(callback1: (...args: any[]) => any, callback2: (...args: any[]) => any): Promise<any> {
    return await Promise.all([
        new Promise(res => {
            setTimeout(() => {
                callback1();
                res();
            }, Math.round(Math.random() * 1000));
        }),
        new Promise(res => {
            setTimeout(() => {
                callback2();
                res();
            }, Math.round(Math.random() * 1000));
        }),
    ]);
}

export function returnsInput<T>(input: T): T {
    return input;
}

export function returnsInstance(input: any): any {
    return new input();
}

// export function someProcessReturnsPromise() {
//     return Promise.resolve();
// }

