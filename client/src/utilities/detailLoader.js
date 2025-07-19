// This loader function returns one specific record

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"; // Fallback for local dev

export async function loader({ request, params }) {
  const id = params.id;
  const response = await fetch(`${API_BASE_URL}/record/${id}`);

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: "Could not fetch data." }), {
      status: 500,
    });
  } else {
    return response;
  }
}
