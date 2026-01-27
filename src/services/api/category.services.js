import { getApi, toQuery } from "./client";

export async function getCategories(params = {}) {
  const qs = toQuery({ page: 1, per_page: 50, ...params });
  const json = await getApi(`/category-types${qs}`);

  if (Array.isArray(json?.serve)) return json.serve;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;

  return [];
}
