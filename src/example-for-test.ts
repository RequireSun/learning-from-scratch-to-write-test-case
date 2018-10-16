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

export function returnSth (type: 'string' | 'boolean' | 'number' | 'object' | 'array' = 'boolean'): string | boolean | number | object | void {
    switch (type) {
        case 'string':
            return 'yes!';
        case 'boolean':
            return true;
        case 'number':
            return 1;
        case 'object':
            return { a: 1, };
        case 'array':
            return [ 1, ];
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

// export function someProcessReturnsPromise() {
//     return Promise.resolve();
// }

