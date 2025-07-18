// This loader function collects all records from the backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"; // Fallback for local dev

export async function loader() {
  const response = await fetch(`${API_BASE_URL}/record/`);
  // const response = await fetch("https://of-server-87a56a44565e.herokuapp.com/record/");

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "From RecordList: Could not fetch data." }),
      { status: 500 }
    );
  } else {
    return response;
  }
}
