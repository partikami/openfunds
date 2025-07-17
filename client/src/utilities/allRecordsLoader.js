// This loader function collects all records from the backend
export async function loader() {
  const response = await fetch("http://localhost:5050/record/");
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
