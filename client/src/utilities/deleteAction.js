import { redirect } from "react-router";

// Uncomment in localhost environment. Comment out in production environment.
export async function action({ params, request }) {
  const id = params.id;
  const response = await fetch("http://localhost:5050/record/" + id, {
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
