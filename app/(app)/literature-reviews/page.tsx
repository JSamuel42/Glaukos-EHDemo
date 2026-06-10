import SearchQueryPage from '@/components/litsearch/SearchQueryPage';
import { OAG_SAVED_SEARCH } from '@/data/demo/litSearchExample';

export default function LiteratureReviewsPage() {
  return <SearchQueryPage initialSavedSearch={OAG_SAVED_SEARCH} />;
}
