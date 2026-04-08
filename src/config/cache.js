import NodeCache from 'node-cache';

const cache = new NodeCache({
    stdTTL: 0,
    checkperiod: 120,
    useClones: false
});

export default cache;