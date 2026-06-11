export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    signalingHubPath: '/hubs/signaling',
    get signalingHubUrl(): string {
        return `${this.apiBaseUrl}${this.signalingHubPath}`;
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