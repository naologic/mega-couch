import { randomBytes, createHmac } from 'crypto';

const loggStringify = (s) => {
    console.log(JSON.stringify(s, null, 2));
};

const logg = (...s) => {
    console.log(...s);
};

const timeCreatedAt = () => {
    return new Date().toISOString();
};

const timeUpdatedAt = () => {
    return new Date().toISOString();
};

/**
 * Generate a safe hash
 * @param {number} bytes
 * @param {string} add
 * @returns {string}
 */
const randomHash = (bytes = 24, ...add: string[]) => {
    const buf = randomBytes(bytes);

    return add.length ? `${add.join('-')}-${buf.toString('hex')}` : buf.toString('hex');
};

export {
    loggStringify,
    logg,
    timeCreatedAt,
    timeUpdatedAt,
    randomHash
}
