import { redirect } from "react-router";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"; // Fallback for local dev

export async function action({ params, request }) {
  const id = params.id;
  const response = await fetch(`${API_BASE_URL}/api/record/${id}`, {
    method: "DELETE",
  });

  // Uncomment in production environment. Comment out in localhost environment.
  /* export async function action({ params, request }) {
  const id = params.id;
  const response = await fetch(
    "https://of-server-87a56a44565e.herokuapp.com/record/" + id,
    {
      method: "DELETE",
    }
  ); */

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Could not delete record.",
      }),
      { status: 500 }
    );
  }
  return redirect("/list");
}
