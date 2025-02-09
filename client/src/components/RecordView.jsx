import React from "react";
// import {useLoaderData} from "react-router";

// const data = useLoaderData();

const RecordView = () => {
  return (
    <div className="m-2">
      <h1>Hier kommt das Detailformular</h1>
    </div>
  );
};

export default RecordView;

export async function loader({ request, params }) {
  const id = params.id;

  const response = await fetch("http://localhost:5050/record/" + id);

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Could not fetch data for this openfunds field.",
      }),
      {
        status: 500,
      }
    );
  } else {
    return response;
  }
}
