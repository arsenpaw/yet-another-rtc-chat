export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    signalingHubPath: '/hubs/signaling',
    roomsHubPath: '/hubs/rooms',
    get signalingHubUrl(): string {
        return `${this.apiBaseUrl}${this.signalingHubPath}`;
    },
    get roomsHubUrl(): string {
        return `${this.apiBaseUrl}${this.roomsHubPath}`;
    },
    rtcConfig: {
        iceServers: [
            {
                urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                ],
            },
        ],
    } as RTCConfiguration,
} as const;