const AVAILABLE_REGIONS = [
    {
        id: 'austria-east-1',
        name: 'Austria East 1',
        location: 'Vienna',
        description: 'Primary machine in Vienna, Austria',
        latency: 'Low',
        status: 'active'
    },
    {
        id: 'austria-east-2',
        name: 'Austria East 2',
        location: 'Vienna',
        description: 'Secondary machine in Vienna, Austria',
        latency: 'Low',
        status: 'active'
    }
];

export function getAvailableRegions() {
    return AVAILABLE_REGIONS.filter(region => region.status === 'active');
}

export function getRegionById(regionId) {
    return AVAILABLE_REGIONS.find(region => region.id === regionId) || null;
}

export function isValidRegion(regionId) {
    const region = getRegionById(regionId);
    return region !== null && region.status === 'active';
}

export function getDefaultRegion() {
    return AVAILABLE_REGIONS[0];
}
