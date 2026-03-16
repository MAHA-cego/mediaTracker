export function getPagination(
  searchParams: URLSearchParams,
  defaultLimit = 10,
) {
  const page = Number(searchParams.get("page") ?? 1);
  const limit = defaultLimit;

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}
