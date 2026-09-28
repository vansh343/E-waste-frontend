import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { company } from '../../api';
import ChatPage from '../../components/ChatPage';

export default function CompanyChat() {
  const { otherId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    company.products().then(setProducts).catch(() => setProducts([]));
  }, []);

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
      productOptions={products}
      counterpartyLabel={`Seller #${otherId}`}
    />
  );
}