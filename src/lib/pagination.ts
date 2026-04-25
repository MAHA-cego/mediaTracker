export function getPagination(
  searchParams: URLSearchParams,
  defaultLimit = 10,
) {
  const page = Math.max(1, Math.floor(Number(searchParams.get("page") ?? 1) || 1));
  const limit = defaultLimit;

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}
