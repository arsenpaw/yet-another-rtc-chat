export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:5000',
    signalingHubPath: '/hubs/signaling',
    roomsHubPath: '/hubs/rooms',

    get signalingHubUrl(): string {
        return `${this.apiBaseUrl}${this.signalingHubPath}`;
    },

    get roomsHubUrl(): string {
        return `${this.apiBaseUrl}${this.roomsHubPath}`;
    },
} as const;
