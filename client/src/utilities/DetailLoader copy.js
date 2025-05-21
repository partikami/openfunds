// This loader function returns one specific record
// and loads the current state of the FieldList component.
import { useRecordStore } from "../store/recordStore";

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
  }

  // Get the record from the API response
  const field = await response.json();

  // Get Zustand state (directly from the store)
  const fields = useRecordStore.getState().fields;
  const currentPage = useRecordStore.getState().currentPage;
  const currentPageSize = useRecordStore.getState().currentPageSize;
  const currentSorting = useRecordStore.getState().currentSorting;

  // Return both the record and the global state
  return { field, fields, currentPage, currentPageSize, currentSorting };
}
