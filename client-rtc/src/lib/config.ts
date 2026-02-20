export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:5000',
    signalingHubPath: '/hubs/signaling',

    get signalingHubUrl(): string {
        return `${this.apiBaseUrl}${this.signalingHubPath}`;
    },
} as const;
