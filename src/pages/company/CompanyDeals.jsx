import DealsView from '../../components/DealsView';
import { company } from '../../api';

export default function CompanyDeals() {
  return (
    <DealsView
      iAmSeller={false}
      loader={company.ledger}
      title="📒 Company Ledger"
      sub="Aapki company aur aapke distributors ki saari pakki hui deals — QR flow yahi se karein"
    />
  );
}