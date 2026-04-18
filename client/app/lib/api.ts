const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getAllSurahs() {
  try {
    const response = await fetch(`${BASE_URL}/api/surah`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
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

export async function getSurahByName(name: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/surah/${name}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error(`Error fetching surah with name ${name}:`, error);
    throw error;
  }
}