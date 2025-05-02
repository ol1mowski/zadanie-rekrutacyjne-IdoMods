export const fetchProducts = async ({ pageNumber = 1, pageSize = 10 } = {}) => {
  try {
    const url = `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Błąd podczas pobierania produktów:', error);
    return { data: [], totalPages: 0, currentPage: pageNumber };
  }
}; 