import { redirect } from "react-router";

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get("mode") || "login";

  console.log(mode);

  if (mode !== "login" && mode !== "signup") {
    return new Response("Invalid mode", { status: 422 });
  }

  const data = await request.formData();
  const authData = {
    email: data.get("email"),
    password: data.get("password"),
  };

  console.log(authData);

  const response = await fetch("http://localhost:5050/" + mode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authData),
    credentials: "include",
  });

  if (response.status === 422 || response.status === 401) {
    return response;
  }

  if (!response.ok) {
    throw new Response(
      JSON.stringify(
        { message: "Could not authenticate user." },
        { status: 500 }
      )
    );
  }

  // soon: manage token
  return redirect("/");
}
