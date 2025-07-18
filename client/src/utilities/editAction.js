import { redirect } from "react-router";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"; // Fallback for local dev

// This action function is used in the Create and Edit routes
export async function action({ request, params }) {
  const method = request.method;
  const data = await request.formData();

  let tags = data.getAll("tags");
  tags = [...new Set(tags)]; // Remove duplicates

  const fieldData = {
    ofid: data.get("ofid"),
    fieldName: data.get("fieldName"),
    dataType: data.get("dataType"),
    description: data.get("description"),
    values: data.get("values"),
    level: data.get("level"),
    tags: tags,
    example: data.get("example"),
    linkReference: data.get("linkReference"),
    introduced: data.get("introduced"),
    introducedArray: data.get("introducedArray"),
    deprecated: data.get("deprecated"),
    deprecatedArray: data.get("deprecatedArray"),
    uploadedFile: data.get("uploadedFile"),
  };

  // Change the URL based on host
  let url = `${API_BASE_URL}/record`;
  // let url = "https://of-server-87a56a44565e.herokuapp.com/record";

  // Change the URL based on host
  if (method === "PATCH") {
    const id = params.id;
    url = `${API_BASE_URL}/record/${id}`;
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
