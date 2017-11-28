export interface Options {
    verbose?: boolean;
    items: OptionsItem[];
}

export interface OptionsItem {
    platforms?: string[]; // weight: 10
    errorCodes?: string[]; // weight: 20
    functions?: string[]; // weight: 50 // Array<keyof typeof FUNCTIONS>
    options: AttemptOptions;
}

export interface AttemptOptions {
    retryIntervalMs: number;
    retryTimeoutMs: number;
}
