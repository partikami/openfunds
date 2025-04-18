// This loader function returns one specific record

// Uncomment in localhost environment. Comment out in production environment.
export async function loader({ request, params }) {
  const id = params.id;
  const response = await fetch("http://localhost:5050/record/" + id);

  // Uncomment in production environment. Comment out in localhost environment.
  /* export async function loader({ request, params }) {
  const id = params.id;
  const response = await fetch(
    "https://of-server-87a56a44565e.herokuapp.com/record/" + id
  ); */

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Could not fetch data.",
      }),
      { status: 500 }
    );
  } else {
    return response;
  }
}
