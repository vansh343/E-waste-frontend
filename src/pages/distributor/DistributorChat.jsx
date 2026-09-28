import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { distributor } from '../../api';
import ChatPage from '../../components/ChatPage';

export default function DistributorChat() {
  const { otherId } = useParams();
  const loadConversation = useCallback(() => distributor.conversation(otherId), [otherId]);
  const restSend = useCallback(
    (receiverId, message) => distributor.sendMessage(receiverId, message),
    [],
  );
  return (
    <ChatPage
      otherId={otherId}
      loadConversation={loadConversation}
      restSend={restSend}
      counterpartyLabel={`Seller #${otherId}`}
    />
  );
}