import { redirect } from "react-router";

// This action function is used in the Create and Edit routes
export async function action({ request, params }) {
  const method = request.method;

  const data = await request.formData();

  const fieldData = {
    ofid: data.get("ofid"),
    fieldName: data.get("fieldName"),
    dataType: data.get("dataType"),
    description: data.get("description"),
    values: data.get("values"),
    level: data.get("level"),
    tags: data.get("tags"),
    example: data.get("example"),
    linkReference: data.get("linkReference"),
    introduced: data.get("introduced"),
    depricated: data.get("depricated"),
  };

  // Change the URL based on host
  let url = "http://localhost:5050/record";
  // let url = "https://of-server-87a56a44565e.herokuapp.com/record";

  // Change the URL based on host
  if (method === "PATCH") {
    const id = params.id;
    url = "http://localhost:5050/record/" + id;
    // url = "https://of-server-87a56a44565e.herokuapp.com/record/" + id;
  }

  let response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fieldData),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message:
          "Field Edit and Field Create Action says: Could not save field.",
      }),
      { status: 500 }
    );
  }

  return redirect("..");
}
