import { useRouteLoaderData } from "react-router";
import FieldDetail from "../components/FieldDetail.jsx";

function FieldDetailPage() {
  const data = useLoaderData("field-detail");
  return <FieldDetail {...loaderData} />;
}

export default FieldDetailPage;
