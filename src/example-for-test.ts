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

export function someProcessSyncFake (): boolean {
    // some conditions
    if (true) {
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
