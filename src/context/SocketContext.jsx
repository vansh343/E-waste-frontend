import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { WS_URL } from '../config';

const SocketContext = createContext(null);

function classify(payload) {
  if (payload && payload.messageId != null && payload.senderId != null) return 'chat';
  if (payload && payload.requestId != null && typeof payload.type === 'string' && payload.type.startsWith('CHAT_REQUEST'))
    return 'request';
  if (
    payload &&
    payload.ledgerId != null &&
    typeof payload.type === 'string' &&
    ['LOCKED', 'ACCEPT_WINDOW', 'DONE'].includes(payload.type)
  )
    return 'deal';
  return null;
}

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const subsRef = useRef({ chat: new Set(), request: new Set(), deal: new Set() });

  const notify = useCallback((kind, payload) => {
    subsRef.current[kind]?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error('socket handler error', e);
      }
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    const client = new Client({
      // SockJS sends withCredentials by default, so the JWT cookie still
      // authenticates the handshake when the backend is cross-origin.
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/chat.${user.id}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            const kind = classify(payload);
            if (kind) notify(kind, payload);
          } catch {
            /* not json */
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    });
    clientRef.current = client;
    client.activate();
    return () => {
      setConnected(false);
      try {
        client.deactivate();
      } catch {
        /* ignore */
      }
      clientRef.current = null;
    };
  }, [user?.id, notify]);

  const subscribe = useCallback((kind, fn) => {
    if (!subsRef.current[kind]) subsRef.current[kind] = new Set();
    subsRef.current[kind].add(fn);
    return () => subsRef.current[kind].delete(fn);
  }, []);

  const sendChat = useCallback((receiverId, message) => {
    const client = clientRef.current;
    if (!client || !client.connected) return false;
    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ receiverId, message }),
    });
    return true;
  }, []);

  return (
    <SocketContext.Provider value={{ connected, subscribe, sendChat }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}