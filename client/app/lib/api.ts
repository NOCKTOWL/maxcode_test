

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getAllSurahs() {
  try {
    const response = await fetch(`${BASE_URL}/api/surah`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    throw error;
  }
}

export async function getSurahById(id: number) {
  
  try {
    const response = await fetch(`${BASE_URL}/api/verses/by_chapter/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error(`Error fetching surah with ID ${id}:`, error);
    throw error;
  }
}