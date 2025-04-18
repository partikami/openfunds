import { useRouteLoaderData } from "react-router";
import FieldEdit from "../components/FieldEdit.jsx";

function FieldEditPage() {
  const data = useRouteLoaderData("field-detail");
  return <FieldEdit method="patch" field={data} />;
}

export default FieldEditPage;
