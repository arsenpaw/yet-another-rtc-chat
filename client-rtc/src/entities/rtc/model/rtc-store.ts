import { create } from "zustand";

interface RTCState {
    localStream: MediaStream | null;
    remoteStreams: Record<string, MediaStream>;
    isConnected: boolean;

    setLocalStream: (stream: MediaStream) => void;
    addRemoteStream: (id: string, stream: MediaStream) => void;
    removeRemoteStream: (id: string) => void;
    setConnected: (isConnected: boolean) => void;
    reset: () => void;
}

export const useRTCStore = create<RTCState>(set => ({
    localStream: null,
    remoteStreams: {},
    isConnected: false,

    setLocalStream: (localStream: MediaStream) => set({ localStream }),
    addRemoteStream: (id: string, stream: MediaStream) => set((state) => ({
        remoteStreams: { ...state.remoteStreams, [id]: stream }
    })),
    removeRemoteStream: (id: string) => set((state) => {
        const newStreams = { ...state.remoteStreams };
        delete newStreams[id];
        return { remoteStreams: newStreams };
    }),
    setConnected: (isConnected: boolean) => set({ isConnected }),
    reset: () => set({ localStream: null, remoteStreams: {}, isConnected: false }),
}));
