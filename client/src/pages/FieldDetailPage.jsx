import { useRouteLoaderData } from "react-router";
import FieldDetail from "../components/FieldDetail.jsx";

function FieldDetailPage() {
  const data = useRouteLoaderData("field-detail");
  return <FieldDetail method="" field={data} />;
}

export default FieldDetailPage;
