import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { company } from '../../api';
import ChatPage from '../../components/ChatPage';

export default function SellerChat() {
  const { otherId } = useParams();
  const loadConversation = useCallback(() => company.conversation(otherId), [otherId]);
  const restSend = useCallback(
    (receiverId, message) => company.sendMessage(receiverId, message),
    [],
  );
  return (
    <ChatPage
      otherId={otherId}
      loadConversation={loadConversation}
      restSend={restSend}
      counterpartyLabel="Kharidar"
    />
  );
}