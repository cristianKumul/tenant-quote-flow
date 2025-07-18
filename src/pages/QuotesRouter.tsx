import { useSearchParams } from "react-router-dom";
import { QuotesList } from "./QuotesList";
import { QuoteBuilder } from "./QuoteBuilder";

export function QuotesRouter() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  return editId ? <QuoteBuilder /> : <QuotesList />;
}