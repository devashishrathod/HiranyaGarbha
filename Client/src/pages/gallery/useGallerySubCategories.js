import { useMemo } from "react";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";

const listOf = (response) => {
  const rows = response?.data?.data || response?.data || [];
  return Array.isArray(rows) ? rows : [];
};

/**
 * Subcategories of the "Gallery" category, found by name the same way the
 * gallery page finds it. Both gallery tabs share the same query keys, so
 * switching tabs does not refetch them.
 */
const useGallerySubCategories = () => {
  const { data: categoriesData } = useGetQuery(
    `${API_ENDPOINTS.CATEGORIES.GET_ALL}?page=1&limit=1000`,
    ["categories", "all"],
  );

  const galleryCategoryId = useMemo(() => {
    const gallery = listOf(categoriesData).find(
      (c) => (c?.name || "").toLowerCase() === "gallery",
    );
    return gallery?._id || "";
  }, [categoriesData]);

  const { data: subCategoriesData } = useGetQuery(
    galleryCategoryId
      ? `${API_ENDPOINTS.SUBCATEGORIES.GET_ALL}?page=1&limit=1000&categoryId=${galleryCategoryId}`
      : null,
    ["subCategories", "gallery", galleryCategoryId],
    { enabled: !!galleryCategoryId },
  );

  const subCategories = useMemo(
    () => listOf(subCategoriesData),
    [subCategoriesData],
  );

  return { galleryCategoryId, subCategories };
};

export default useGallerySubCategories;
