type PageResult<T> = {
  data: T[] | null;
  error: Error | null;
};

type FetchAllRowsOptions = {
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 1000;

export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => Promise<PageResult<T>>,
  options: FetchAllRowsOptions = {},
) {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await fetchPage(from, to);

    if (error) throw error;

    const page = data ?? [];
    rows.push(...page);

    if (page.length < pageSize) {
      return rows;
    }
  }
}
